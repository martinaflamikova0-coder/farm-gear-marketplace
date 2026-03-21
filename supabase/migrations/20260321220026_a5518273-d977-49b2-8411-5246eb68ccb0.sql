
-- Désactiver le compte B
UPDATE bank_accounts SET is_active = false WHERE id = '0cfed41d-11bc-4148-8e92-6e3a7215993b';

-- Mettre à jour le compte A avec les nouvelles coordonnées et sans plafond
UPDATE bank_accounts 
SET bank_name = 'POSTEPAY S.P.A',
    iban = 'IT81Z3608105138269368669875',
    bic = 'PPAYITR1XXX',
    holder = 'ELENA PASQUALI',
    name = 'Compte principal',
    threshold_min = 0,
    threshold_max = NULL,
    is_active = true,
    updated_at = now()
WHERE id = 'cfc5f63c-9cc6-464a-913c-980018308768';
