-- Move days 26-30 to Confissões de Fé module
UPDATE module_days 
SET module_id = 'af5d3f77-2417-4d22-94d1-8d779a531528'
WHERE module_id = 'dc256854-15c3-4905-81ed-1e6d635d6ff3';

-- Delete the separate Module 6 entry
DELETE FROM modules WHERE id = 'dc256854-15c3-4905-81ed-1e6d635d6ff3';
