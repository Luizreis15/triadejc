-- Add card_id column to module_pdfs to link PDFs to specific chapters
ALTER TABLE module_pdfs 
ADD COLUMN card_id uuid REFERENCES module_cards(id);