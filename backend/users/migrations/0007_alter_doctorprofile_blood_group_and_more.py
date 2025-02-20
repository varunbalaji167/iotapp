# Generated by Django 5.1.2 on 2024-11-03 05:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0006_doctorprofile_blood_group_doctorprofile_gender_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='doctorprofile',
            name='blood_group',
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
        migrations.AlterField(
            model_name='doctorprofile',
            name='gender',
            field=models.CharField(choices=[('Male', 'Male'), ('Female', 'Female'), ('Others', 'Others')], max_length=50),
        ),
        migrations.AlterField(
            model_name='patientprofile',
            name='gender',
            field=models.CharField(choices=[('Male', 'Male'), ('Female', 'Female'), ('Others', 'Others')], max_length=50),
        ),
    ]
