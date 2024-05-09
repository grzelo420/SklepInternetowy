"""
INSTRUKCJA
1. pip install psycopg2
2. Zmienic ścieżkę global_user_path, tak aby wskazywała na folder script
3. W metodzie main wstawic swoje parametry bazy danych
4. Uruchomić program
"""
import psycopg2
import time

global_user_path = "C:/Users/HP/Desktop/SklepInternetowy/script/"
def execute_sql_from_file(cursor, file_path):
    """Wykonuje skrypt SQL z podanego pliku."""
    with open(file_path, 'r') as file:
        sql_script = file.read()
    cursor.execute(sql_script)

def execute_sql_from_file2(connection, file_path):
    """Wykonuje skrypt SQL z podanego pliku."""
    cursor = connection.cursor()
    with open(file_path, 'r') as file:
        sql_script = file.read()
    cursor.execute(sql_script)
    connection.commit()
    cursor.close()
    connection.close()


def execute_many_sql_from_file(file_path, connection):
    """Wykonuje skrypt SQL z podanego pliku."""
    cursor = connection.cursor()

    with open(file_path, 'r') as file:
        sql_script = file.read()

    # Dzielenie skryptu na poszczególne instrukcje
    sql_commands = sql_script.split(';')

    # Wykonywanie każdej instrukcji oddzielnie
    for command in sql_commands:
        if command.strip():
            cursor.execute(command)

    # Zatwierdzenie transakcji
    connection.commit()


def sequence_exists(cursor, sequence_name):
    """Sprawdza, czy sekwencja istnieje w bazie danych."""
    cursor.execute("SELECT EXISTS(SELECT * FROM pg_class WHERE relkind = 'S' AND relname = %s)", (sequence_name,))
    return cursor.fetchone()[0]


def insert_all_data(connection):
    # Lista ścieżek do plików SQL z przykładowymi danymi
    sql_file_paths = [global_user_path + 'randomData/uzytkownicy.sql',
                      global_user_path + 'randomData/pracownicy.sql',
                      global_user_path + 'randomData/klienci.sql',

                      global_user_path + 'randomData/numery_telefonu.sql',
                      global_user_path + 'randomData/adresy_email.sql',
                      global_user_path + 'randomData/adresy.sql',

                      global_user_path + 'randomData/uzytkownicy_numery_telefonu.sql',
                      global_user_path + 'randomData/uzytkownicy_adresy_email.sql',
                      global_user_path + 'randomData/uzytkownicy_adresy.sql',

                      global_user_path + 'randomData/producenci.sql',
                      global_user_path + 'randomData/kategorie.sql',
                      global_user_path + 'randomData/rozmiary.sql',
                      global_user_path + 'randomData/produkty.sql',

                      global_user_path + 'randomData/zamowienia.sql'
                      ]

    # Scieżka do pliku czyszczącego dane
    sql_delete_data_path = global_user_path + 'procedures/BD2_clear_data.sql'

    try:
        # Nawiązanie połączenia
        cursor = connection.cursor()

        with open(sql_delete_data_path, 'r') as file:
            for line in file:
                line = line.strip()  # Usunięcie białych znaków na początku i na końcu linii
                if not line:  # Pomiń puste linie
                    continue
                # Sprawdzenie czy linia zawiera 'ALTER SEQUENCE'
                if 'ALTER SEQUENCE' in line:
                    sequence_name = line.split()[2]  # Założenie, że nazwa sekwencji jest trzecim słowem
                    if sequence_exists(cursor, sequence_name):
                        cursor.execute(line)
                else:
                    cursor.execute(line)

        # Zatwierdzenie transakcji
        connection.commit()

        for file_path in sql_file_paths:
            start_time = time.time()

            # Wykonanie skryptu z każdego pliku
            execute_sql_from_file(cursor, file_path)

            # Zatwierdzenie transakcji
            connection.commit()

            end_time = time.time()
            print(f"Czas wykonania skryptu z {file_path}: {end_time - start_time} sekund.")

    except Exception as e:
        print(f"Wystąpił błąd: {e}")
    finally:
        # Zamknięcie połączenia i kursora
        if connection is not None:
            cursor.close()
            #connection.close()


def find_random_customer_id(cursor):
    """Znajduje losowe ID klienta w tabeli zamowienia i mierzy czas wykonania operacji."""
    start_time = time.time()
    cursor.execute("SELECT id_klienta FROM zamowienia ORDER BY RANDOM() LIMIT 1")
    result = cursor.fetchone()
    end_time = time.time()
    elapsed_time = end_time - start_time
    return (result[0] if result else None, elapsed_time)


def measure_search_time(host, dbname, user, password):
    try:
        # Nawiązanie połączenia
        conn = psycopg2.connect(host=host, dbname=dbname, user=user, password=password)
        cursor = conn.cursor()

        # Znajdź losowe ID klienta
        random_customer_id, time_taken = find_random_customer_id(cursor)
        # if random_customer_id:
        #     print(f"Losowe ID klienta: {random_customer_id}, czas wykonania: {time_taken}")
        # else:
        #     print("Nie znaleziono klientów.")
        return time_taken

    except Exception as e:
        print(f"Wystąpił błąd: {e}")
    finally:
        # Zamknięcie połączenia i kursora
        if conn is not None:
            cursor.close()
            conn.close()

def main():
    # Parametry połączenia (wstaw swoje parametry)
    host = "localhost"
    dbname = "bazaDanych"
    user = ""
    password = ""

    # Połączenie
    connection = psycopg2.connect(host=host, dbname=dbname, user=user, password=password)

    """Tworzenie tabel"""
    file_path_create_table = global_user_path + 'procedures/BD2_tabele.sql'
    execute_many_sql_from_file(file_path_create_table, connection)

    """Wypełnianie tabel danymi"""
    insert_all_data(connection)

    """Tworzenie funkcji"""
    file_path_create_function = global_user_path + 'procedures/BD2_logowanie.sql'
    execute_sql_from_file2(connection, file_path_create_function)

    """Wstawienie widoków"""
    file_path_views = 'C:/Users/HP/Desktop/bazaDanychPliki/BD2_widoki.sql'
    #execute_many_sql_from_file(file_path_views, connection)

    """Triggery"""
    # DODAC PRZEZ SQL TOOL terminal

    """Tworzenie funkcji dodającej użytkownika"""
    file_path_add_user_function = 'C:/Users/HP/Desktop/bazaDanychPliki/BD2_dodaj_uzytkownika.sql'
    # execute_many_sql_from_file(file_path_add_user_function, connection)

    """Dodawanie użytkownika"""
    file_path_add_user = 'C:/Users/HP/Desktop/bazaDanychPliki/BD2_users.sql'
    # execute_many_sql_from_file(file_path_add_user, connection)

    file_path_returns = 'C:/Users/HP/Desktop/bazaDanychPliki/randomData/zwroty.sql'
    #execute_many_sql_from_file(file_path_returns, connection)

    """Testy"""
    #modify_sql_file('C:/Users/HP/Desktop/bazaDanychPliki/randomData/zamowienia.sql', 'C:/Users/HP/Desktop/bazaDanychPliki/randomData/zamowieniapo100k.sql')
    # averageTime = 0
    # nrOfTests = 100
    # for i in range(nrOfTests):
    #     if i % 10 == 0:
    #         print(i)
    #     averageTime += measure_search_time(host,dbname,user,password)
    # averageTime /= nrOfTests
    # print(f"Średni czas wyszukiwania dla {nrOfTests} testów: {averageTime}s")


if __name__ == "__main__":
    main()
