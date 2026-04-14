
-- Update technical courses with default values
UPDATE courses SET 
  hours = 1440,
  duration_range = '6 a 18 meses',
  certification = 'Certificação válida para registro no órgão competente'
WHERE category = 'tecnico' AND (hours IS NULL OR duration_range IS NULL OR certification IS NULL);

-- Update competencia courses
UPDATE courses SET 
  hours = 1200,
  duration_range = '3 a 6 meses',
  certification = 'Certificação válida para registro profissional'
WHERE category = 'competencia' AND (hours IS NULL OR duration_range IS NULL OR certification IS NULL);

-- Update pos-tecnico courses
UPDATE courses SET 
  hours = 800,
  duration_range = '6 a 12 meses',
  certification = 'Certificação válida para especialização técnica'
WHERE category = 'pos-tecnico' AND (hours IS NULL OR duration_range IS NULL OR certification IS NULL);
