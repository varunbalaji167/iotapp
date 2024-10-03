# Generated by Django 5.1.1 on 2024-10-02 18:42

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0006_remove_patientdata_blood_pressure_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='patientdata',
            name='temperature',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=4, null=True),
        ),
        migrations.CreateModel(
            name='DoctorData',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('heart_rate', models.PositiveIntegerField(blank=True, null=True)),
                ('temperature', models.DecimalField(blank=True, decimal_places=2, max_digits=4, null=True)),
                ('respiratory_rate', models.PositiveIntegerField(blank=True, null=True)),
                ('spo2', models.PositiveIntegerField(blank=True, null=True)),
                ('doctor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='vitals', to='users.doctorprofile')),
            ],
        ),
    ]