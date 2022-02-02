from django.db import models

import string
import random

def generate_unique_code():
    length = 6
    while True:
        code = ''.join(
            random.choices(string.ascii_uppercase, k=length))
        if Room.objects.filter(code=code).count() == 0:
            break
    return code

from django.contrib.auth.models import User


class Pool(models.Model):
    name = models.CharField(max_length=50, unique=True)
    user_id = models.IntegerField(null=False)
    created_at = models.DateTimeField(auto_now_add=True)
    code = models.CharField(max_length=50, unique=True)
    class Meta:
        db_table = 'pool'

class Lead(models.Model):

    company_id = models.IntegerField(null=False)
    company_name = models.CharField(max_length=255, null=False)
    title = models.CharField(max_length=255, null=False)
    phone = models.CharField(max_length=255)
    town = models.CharField(max_length=255)
    town_id =  models.IntegerField()
    group_3 = models.CharField(max_length=255)  
    group_2 = models.CharField(max_length=255)  
    group_1 = models.CharField(max_length=255) 
    epoch = models.IntegerField(null=False)
    actively_hiring = models.IntegerField()
    seniority_level = models.CharField(max_length=255) 
    job_type = models.CharField(max_length=255)
    salary = models.CharField(max_length=255)
    number_of_applicants = models.IntegerField()
    description = models.CharField(max_length=10000, null=False)

class FilterLeads(models.Model):

    town_id = models.IntegerField()
    country_id = models.IntegerField()
    seniority_level_id = models.IntegerField()
    job_type_id = models.IntegerField()
    job_function_id = models.IntegerField()
    company_size_id = models.IntegerField()
    salary_start = models.IntegerField()
    salary_end = models.IntegerField()
    industry_id = models.IntegerField()
    epoch = models.IntegerField()
    description = models.CharField(max_length= 50000, null=False)

class HiringManager(models.Model):

    job_id = models.IntegerField()
    hiring_manager = models.CharField(max_length=255, null=False)
    hiring_manager_title = models.CharField(max_length=255, null=False)
    hiring_manager_linkedin = models.CharField(max_length=255, null=False)
    hiring_manager_email = models.CharField(max_length=255)

class Company(models.Model):

    industry = models.CharField(max_length=255)
    company_size = models.CharField(max_length=255)  
    headquarters = models.CharField(max_length=255) 
    company_type = models.CharField(max_length=255) 
    creation_year = models.IntegerField()
    company_revenue = models.CharField(max_length=255) 

class CompanyTown(models.Model):

    company_id = models.IntegerField()
    town = models.CharField(max_length=255, null=False)  
    address = models.CharField(max_length=255)  
    phone = models.CharField(max_length=255) 

class CompanySpecialty(models.Model):
    company_id = models.IntegerField()
    specialty = models.CharField(max_length=255, null=False)

class CorrPoolUnwanted(models.Model):
    pool_id = models.IntegerField(null=False)
    job_id = models.IntegerField(null=False)
    class Meta:
        db_table = 'corr_pool_unwanted'

class CorrPoolUser(models.Model):
    pool_id = models.IntegerField(null=False)
    user_id = models.IntegerField(null=False)
    class Meta:
        db_table = 'corr_pool_user'

class CorrPoolUserJob(models.Model):
    pool_id = models.IntegerField(null=False)
    user_id = models.IntegerField(null=False)
    job_id = models.IntegerField(null=False)
    class Meta:
        db_table = 'corr_pool_user_job'

class CorrCompanyTown(models.Model):
    company_id = models.IntegerField(null=False)
    town_id = models.IntegerField(null=False)
    address = models.CharField(max_length=255) 
    phone = models.CharField(max_length=255)
    class Meta:
        db_table = 'corr_company_town'

################################ Jobs

class CorrJobFunction(models.Model):
    job_id = models.IntegerField()
    job_function_id = models.IntegerField()

    class Meta:
        db_table = 'corr_job_function'

class JobFunctionNorm(models.Model):
    name = models.CharField(unique=True, max_length=255, null=False)
    class Meta:
        db_table = 'job_function_norm'    

class JobTypeNorm(models.Model):
    name = models.CharField(unique=True, max_length=255, null=False)
    class Meta:
        db_table = 'job_type_norm'

class SeniorityLevelNorm(models.Model):
    name = models.CharField(unique=True, max_length=255, null=False)
    class Meta:
        db_table = 'seniority_level_norm'

class Industry(models.Model):
    name = models.CharField(unique=True, max_length=255, null=False)
    class Meta:
        db_table = 'industry'
