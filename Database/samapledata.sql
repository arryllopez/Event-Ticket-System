-- Event Ticketing System - Sample Data
-- Phase II - Part B: Sample Data 

-- CATEGORY data
INSERT INTO CATEGORY (category_name, description) VALUES
('Concert', 'Live music performances and shows'),
('Sports', 'Sporting events and competitions'),
('Theater', 'Stage plays and theatrical performances'),
('Conference', 'Professional conferences and seminars'),
('Comedy', 'Stand-up comedy and comedy shows'),
('Festival', 'Cultural and music festivals');

-- VENUE data
INSERT INTO VENUE (venue_name, address, city, capacity, phone) VALUES
('Grand Arena', '123 Main Street', 'Toronto', 15000, '416-555-0101'),
('City Theater', '456 Queen Street West', 'Toronto', 1200, '416-555-0102'),
('Community Center', '789 King Street', 'Oshawa', 500, '905-555-0103'),
('Sports Complex', '321 Stadium Road', 'Mississauga', 25000, '905-555-0104'),
('Convention Hall', '654 Conference Drive', 'Toronto', 3000, '416-555-0105'),
('Outdoor Park', '987 Park Avenue', 'Oshawa', 10000, '905-555-0106');

-- EVENT data
INSERT INTO EVENT (event_name, event_date, description, organizer_name, organizer_email, category_id, venue_id, total_tickets, tickets_sold, status, total_revenue) VALUES
('Rock Legends Live', '2025-12-15 19:00:00', 'Classic rock tribute concert', 'LiveNation Events', 'contact@livenation.com', 1, 1, 10000, 4500, 'Upcoming', 559000.00),
('Basketball Championship', '2025-11-20 18:30:00', 'Regional basketball finals', 'Sports Management Inc', 'info@sportsmanage.com', 2, 4, 20000, 15000, 'Upcoming', 1075000.00),
('Shakespeare Festival', '2025-11-10 20:00:00', 'A Midsummer Nights Dream', 'Theater Guild', 'admin@theaterguild.com', 3, 2, 800, 650, 'Upcoming', 34125.00),
('Tech Innovation Summit', '2025-12-05 09:00:00', 'Annual technology conference', 'TechConnect', 'events@techconnect.com', 4, 5, 2500, 1200, 'Upcoming', 199900.00),
('Comedy Night Special', '2025-11-25 21:00:00', 'Stand-up comedy showcase', 'Laugh Factory', 'bookings@laughfactory.com', 5, 2, 1000, 800, 'Upcoming', 10500.00),
('Summer Music Festival', '2025-06-20 14:00:00', 'Three-day outdoor music festival', 'Festival Productions', 'info@festivalprod.com', 6, 6, 8000, 8000, 'Completed', 800000.00),
('Jazz Evening', '2025-11-08 19:30:00', 'Smooth jazz performance', 'City Events', 'jazz@cityevents.com', 1, 3, 400, 320, 'Upcoming', 17600.00);


-- TICKET data (multiple ticket types per event)
INSERT INTO TICKET (event_id, ticket_type, price, quantity_available) VALUES
-- Rock Legends Live (event_id: 1)
(1, 'General Admission', 75.00, 3500),
(1, 'VIP', 150.00, 1500),
(1, 'Premium Floor', 250.00, 500),
-- Basketball Championship (event_id: 2)
(2, 'Upper Bowl', 45.00, 3000),
(2, 'Lower Bowl', 85.00, 1500),
(2, 'Courtside', 300.00, 500),
-- Shakespeare Festival (event_id: 3)
(3, 'Standard Seating', 40.00, 100),
(3, 'Premium Seating', 65.00, 50),
-- Tech Innovation Summit (event_id: 4)
(4, 'Early Bird', 199.00, 800),
(4, 'Regular Pass', 299.00, 400),
(4, 'VIP Pass', 499.00, 100),
-- Comedy Night Special (event_id: 5)
(5, 'General Seating', 35.00, 150),
(5, 'Front Row', 60.00, 50),
-- Summer Music Festival (event_id: 6)
(6, '3-Day Pass', 120.00, 0),
(6, 'VIP 3-Day Pass', 250.00, 0),
-- Jazz Evening (event_id: 7)
(7, 'General Admission', 30.00, 60),
(7, 'Table Seating', 55.00, 20);

-- CUSTOMER data
INSERT INTO CUSTOMER (first_name, last_name, email, phone, registration_date) VALUES
('John', 'Smith', 'john.smith@email.com', '416-555-1001', '2024-03-15'),
('Emily', 'Johnson', 'emily.j@email.com', '905-555-1002', '2024-05-20'),
('Michael', 'Williams', 'mwilliams@email.com', '416-555-1003', '2024-01-10'),
('Sarah', 'Brown', 'sarah.brown@email.com', '905-555-1004', '2024-07-22'),
('David', 'Jones', 'djones@email.com', '416-555-1005', '2024-02-28'),
('Jennifer', 'Garcia', 'jgarcia@email.com', '905-555-1006', '2024-06-12'),
('Robert', 'Martinez', 'rmartinez@email.com', '416-555-1007', '2024-04-18'),
('Lisa', 'Anderson', 'landerson@email.com', '905-555-1008', '2024-08-05');

-- PURCHASE data
INSERT INTO PURCHASE (customer_id, purchase_date, total_amount, payment_method, payment_status) VALUES
(1, '2025-10-15 14:30:00', 150.00, 'Credit Card', 'Completed'),
(2, '2025-10-16 10:20:00', 425.00, 'Credit Card', 'Completed'),
(3, '2025-10-17 16:45:00', 170.00, 'Debit Card', 'Completed'),
(4, '2025-10-18 11:00:00', 199.00, 'PayPal', 'Completed'),
(5, '2025-10-19 13:15:00', 600.00, 'Credit Card', 'Completed'),
(6, '2025-10-20 09:30:00', 105.00, 'Debit Card', 'Completed'),
(7, '2025-10-21 15:00:00', 240.00, 'Credit Card', 'Completed'),
(1, '2025-10-22 12:00:00', 130.00, 'Credit Card', 'Completed');

-- PURCHASE_TICKET data (junction table)
INSERT INTO PURCHASE_TICKET (purchase_id, ticket_id, quantity, subtotal) VALUES
-- Purchase 1: Customer 1 buys 2 General Admission for Rock Legends
(1, 1, 2, 150.00),
-- Purchase 2: Customer 2 buys VIP for Rock Legends + Courtside for Basketball
(2, 2, 1, 150.00),
(2, 6, 1, 300.00),
-- Purchase 3: Customer 3 buys Basketball Upper Bowl tickets
(3, 4, 2, 90.00),
(3, 5, 1, 85.00),
-- Purchase 4: Customer 4 buys Tech Summit Early Bird
(4, 9, 1, 199.00),
-- Purchase 5: Customer 5 buys 2 Courtside Basketball tickets
(5, 6, 2, 600.00),
-- Purchase 6: Customer 6 buys Comedy Night tickets
(6, 12, 3, 105.00),
-- Purchase 7: Customer 7 buys Premium Floor Rock Legends
(7, 3, 1, 250.00),
-- Purchase 8: Customer 1 buys Shakespeare tickets
(8, 7, 2, 80.00),
(8, 8, 1, 65.00);