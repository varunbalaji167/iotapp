#!/usr/bin/env python
import os
import sys
import threading
# from users.mqtt_client import setup_mqtt_client
import environ

# def run_mqtt_client():
#     """Run the MQTT client in a separate thread."""
#     client = setup_mqtt_client()
#     client.loop_forever()
env = environ.Env()
environ.Env.read_env()

os.environ.setdefault('DJANGO_SETTINGS_MODULE', env('DJANGO_SETTINGS_MODULE', default='backend.settings'))

def main():
    """Run administrative tasks."""

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

    # # Run MQTT client in a separate thread
    # mqtt_thread = threading.Thread(target=run_mqtt_client, daemon=True)
    # mqtt_thread.start()

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
