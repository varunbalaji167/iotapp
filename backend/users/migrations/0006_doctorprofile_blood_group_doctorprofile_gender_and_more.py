# Generated by Django 5.1.2 on 2024-11-03 05:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0005_remove_patientprofile_height_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='doctorprofile',
            name='blood_group',
            field=models.CharField(blank=True, default='O+', max_length=10, null=True),
        ),
        migrations.AddField(
            model_name='doctorprofile',
            name='gender',
            field=models.CharField(choices=[('Male', 'Male'), ('Female', 'Female'), ('Others', 'Others')], default='Male', max_length=50),
        ),
        migrations.AddField(
            model_name='patientprofile',
            name='gender',
            field=models.CharField(choices=[('Male', 'Male'), ('Female', 'Female'), ('Others', 'Others')], default='Male', max_length=50),
        ),
    ]
