# Generated by Django 5.1.2 on 2024-10-29 09:41

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_doctordata_dia_doctordata_heart_rate_bp_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='doctordata',
            name='oxygen_level',
        ),
        migrations.RemoveField(
            model_name='patientdata',
            name='oxygen_level',
        ),
        migrations.RemoveField(
            model_name='vitalhistorydoctor',
            name='oxygen_level',
        ),
        migrations.RemoveField(
            model_name='vitalhistorypatient',
            name='oxygen_level',
        ),
    ]
