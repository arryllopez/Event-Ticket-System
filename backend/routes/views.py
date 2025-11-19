from flask import Blueprint, jsonify
from sqlalchemy import text
from backend.db import db

views_bp = Blueprint("views_bp", __name__)

def execute_query(sql, params=None):
    with db.engine.connect() as con:
        result = con.execute(text(sql), params or {})
        rows = result.fetchall()
        return [dict(row._mapping) for row in rows]

@views_bp.route("/view1")
def view1():
    sql = """
    SELECT
        e.event_id,
        e.event_name,
        c.category_name,
        v.venue_name,
        v.city,
        e.event_date,
        e.total_tickets,
        e.tickets_sold,
        COALESCE(SUM(pt.subtotal), 0) AS total_revenue
    FROM event e
    JOIN category c ON e.category_id = c.category_id
    JOIN venue v ON e.venue_id = v.venue_id
    LEFT JOIN ticket t ON t.event_id = e.event_id
    LEFT JOIN purchase_ticket pt ON pt.ticket_id = t.ticket_id
    GROUP BY e.event_id, e.event_name, c.category_name, v.venue_name, v.city,
             e.event_date, e.total_tickets, e.tickets_sold
    """
    results = execute_query(sql)
    return jsonify(results)

@views_bp.route("/view2")
def view2():
    sql = """
    SELECT
        v.venue_id,
        v.venue_name,
        v.city,
        COUNT(e.event_id) AS total_events,
        SUM(e.tickets_sold) AS total_tickets_sold
    FROM venue v
    JOIN event e ON v.venue_id = e.venue_id
    GROUP BY v.venue_id, v.venue_name, v.city
    HAVING SUM(e.tickets_sold) >= ALL (
        SELECT SUM(e2.tickets_sold)
        FROM event e2
        GROUP BY e2.venue_id
    )
    """
    results = execute_query(sql)
    return jsonify(results)

# Add additional routes (view3, view4, ... view10) using similar pattern here

@views_bp.route("/view3")
def view3():
    sql = """
    SELECT
        c.customer_id,
        CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
        p.purchase_id,
        p.purchase_date,
        p.total_amount AS purchase_total,
        (
            SELECT AVG(p2.total_amount)
            FROM PURCHASE p2
            WHERE p2.customer_id = c.customer_id
        ) AS avg_customer_spending
    FROM CUSTOMER c
    JOIN PURCHASE p ON c.customer_id = p.customer_id
    WHERE p.total_amount > (
            SELECT AVG(p3.total_amount)
            FROM PURCHASE p3
            WHERE p3.customer_id = c.customer_id
        )
    """
    results = execute_query(sql)
    return jsonify(results)

@views_bp.route("/view4")
def view4():
    sql = """
    SELECT
        c.customer_id,
        c.first_name,
        c.last_name,
        p.purchase_id,
        p.purchase_date,
        p.total_amount
    FROM CUSTOMER c
    LEFT JOIN PURCHASE p
        ON c.customer_id = p.customer_id

    UNION

    SELECT
        c.customer_id,
        c.first_name,
        c.last_name,
        p.purchase_id,
        p.purchase_date,
        p.total_amount
    FROM CUSTOMER c
    RIGHT JOIN PURCHASE p
        ON c.customer_id = p.customer_id
    WHERE c.customer_id IS NULL
    """
    results = execute_query(sql)
    return jsonify(results)

@views_bp.route("/view5")
def view5():
    sql = """
    SELECT DISTINCT
        c.customer_id,
        CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
        c.email,
        e.event_id,
        e.event_name,
        cat.category_name
    FROM CUSTOMER c
    JOIN PURCHASE p ON c.customer_id = p.customer_id
    JOIN PURCHASE_TICKET pt ON p.purchase_id = pt.purchase_id
    JOIN TICKET t ON pt.ticket_id = t.ticket_id
    JOIN EVENT e ON t.event_id = e.event_id
    JOIN CATEGORY cat ON e.category_id = cat.category_id
    WHERE e.event_id IN (
            SELECT e1.event_id
            FROM EVENT e1
            JOIN CATEGORY cat1 ON e1.category_id = cat1.category_id
            WHERE cat1.category_name = 'Concert'

            UNION

            SELECT e2.event_id
            FROM EVENT e2
            JOIN CATEGORY cat2 ON e2.category_id = cat2.category_id
            WHERE cat2.category_name = 'Sports'
        )
    """
    results = execute_query(sql)
    return jsonify(results)

@views_bp.route("/view6")
def view6():
    sql = """
    SELECT
        cat.category_id,
        cat.category_name,
        COUNT(DISTINCT e.event_id) AS total_events,
        SUM(e.tickets_sold) AS total_tickets_sold,
        SUM(pt.subtotal) AS total_revenue
    FROM CATEGORY cat
    JOIN EVENT e ON cat.category_id = e.category_id
    JOIN TICKET t ON e.event_id = t.event_id
    JOIN PURCHASE_TICKET pt ON pt.ticket_id = t.ticket_id
    GROUP BY cat.category_id, cat.category_name
    ORDER BY total_tickets_sold DESC, total_revenue DESC
    """
    results = execute_query(sql)
    return jsonify(results)

@views_bp.route("/view7")
def view7():
    sql = """
    SELECT
        e.event_id,
        e.event_name,
        c.category_name,
        v.venue_name,
        e.event_date,
        e.total_tickets,
        e.tickets_sold,
        (e.total_tickets - e.tickets_sold) AS tickets_remaining
    FROM EVENT e
    JOIN CATEGORY c ON e.category_id = c.category_id
    JOIN VENUE v ON e.venue_id = v.venue_id
    WHERE (e.total_tickets - e.tickets_sold) <= 500
    ORDER BY tickets_remaining ASC
    """
    results = execute_query(sql)
    return jsonify(results)

@views_bp.route("/view8")
def view8():
    sql = """
    SELECT
        e.event_id,
        e.event_name,
        c.category_name,
        v.venue_name,
        e.event_date,
        e.total_tickets,
        e.tickets_sold,
        (e.total_tickets - e.tickets_sold) AS tickets_remaining
    FROM EVENT e
    JOIN CATEGORY c ON e.category_id = c.category_id
    JOIN VENUE v ON e.venue_id = v.venue_id
    WHERE e.status = 'Upcoming'
      AND e.tickets_sold < (e.total_tickets * 0.7)
    ORDER BY e.tickets_sold ASC
    """
    results = execute_query(sql)
    return jsonify(results)

@views_bp.route("/view9")
def view9():
    sql = """
    SELECT
        c.customer_id,
        CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
        c.email,
        cat.category_name,
        COUNT(pt.ticket_id) AS tickets_purchased,
        SUM(pt.subtotal) AS total_spent
    FROM CUSTOMER c
    JOIN PURCHASE p ON c.customer_id = p.customer_id
    JOIN PURCHASE_TICKET pt ON p.purchase_id = pt.purchase_id
    JOIN TICKET t ON pt.ticket_id = t.ticket_id
    JOIN EVENT e ON t.event_id = e.event_id
    JOIN CATEGORY cat ON e.category_id = cat.category_id
    GROUP BY c.customer_id, c.first_name, c.last_name, c.email, cat.category_name
    HAVING COUNT(p.purchase_id) > 1
    ORDER BY total_spent DESC
    """
    results = execute_query(sql)
    return jsonify(results)


@views_bp.route("/view10")
def view10():
    sql = """
    SELECT
        cat.category_name,
        c.customer_id,
        CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
        c.email,
        SUM(pt.subtotal) AS total_spent,
        COUNT(pt.ticket_id) AS tickets_purchased
    FROM CUSTOMER c
    JOIN PURCHASE p ON c.customer_id = p.customer_id
    JOIN PURCHASE_TICKET pt ON p.purchase_id = pt.purchase_id
    JOIN TICKET t ON pt.ticket_id = t.ticket_id
    JOIN EVENT e ON t.event_id = e.event_id
    JOIN CATEGORY cat ON e.category_id = cat.category_id
    GROUP BY cat.category_name, c.customer_id, customer_name, c.email
    ORDER BY cat.category_name, total_spent DESC
    """
    results = execute_query(sql)
    return jsonify(results)
