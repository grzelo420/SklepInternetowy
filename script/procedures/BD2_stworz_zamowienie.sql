CREATE OR REPLACE FUNCTION stworz_zamowienie(p_id_klienta INTEGER)
RETURNS INTEGER AS $$
DECLARE
    v_new_order_id INTEGER;
BEGIN
    SELECT NEXTVAL('zamowienia_id_seq') INTO v_new_order_id;

    INSERT INTO zamowienia (
        id_zamowienia,
        id_klienta,
        data_zlozenia_zamowienia,
        data_przyjecia_zamowienia,
        data_wysylki,
        data_oplacenia,
        cena_zakupu
    ) VALUES (
        v_new_order_id,
        p_id_klienta,
        NULL,
        NULL,
        NULL,
        NULL,
        0
    );
   
    RETURN v_new_order_id;
END;
$$ LANGUAGE plpgsql;