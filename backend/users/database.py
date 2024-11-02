import mysql.connector
from mysql.connector import Error

def insert_health_data(data):
    """
    Inserts health data into a MySQL database table.

    Parameters:
        data (list): A list containing health metrics in the following order:
                     [Temperature, SpO2, HeartRate, Height, Weight, BP_sys, BP_dia, Glucose, Timestamp, BMI]
    """
    try:
        # Establish the database connection
        connection = mysql.connector.connect(
            host='charakdb.clk0zugigs1w.ap-south-1.rds.amazonaws.com',         # Replace with your MySQL host
            user='admin',     # Replace with your MySQL username
            password='Jkexcel4495', # Replace with your MySQL password
            database='charakdbase'  # Replace with your database name
        )

        if connection.is_connected():
            cursor = connection.cursor()
            
            # Define the INSERT query with placeholders
            insert_query = """
            INSERT INTO Doctor_hk_vitals (Timestamp, Temperature, SpO2, HeartRate, Height, Weight, BMI, BP_sys, BP_dia, Glucose, BP_hr, Abha_ID)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            
            # Execute the query with the modified data array
            cursor.execute(insert_query, data)
            
            # Commit the transaction
            connection.commit()
            print("Data inserted successfully.")

    except Error as e:
        print("Error while connecting to MySQL", e)
    
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL connection is closed.")

# Sample data array (excluding Timestamp, which will be added in the function)
# data_array = [36.6, 98, 72, 170, 70.5, 120, 22, 80, 90, 79]
# insert_health_data(data_array)