from rest_framework import serializers
from .models import *
from django.contrib.auth.models import User
from django.contrib.auth import authenticate


# User Serializer
class UserSerializer(serializers.ModelSerializer):
  class Meta:
    model = User
    fields = ('id', 'first_name', 'last_name', 'username')

# Register Serializer
class RegisterSerializer(serializers.ModelSerializer):
  class Meta:
    model = User
    fields = ('id', 'first_name', 'last_name', 'email', 'password')

  def create(self, validated_data):
    user = User.objects.create_user(
      username=validated_data['email'], 
      first_name=validated_data['first_name'],
      last_name=validated_data['last_name'],
      password=validated_data['password']
    )

    return user

# Login Serializer
class LoginSerializer(serializers.Serializer):
  username = serializers.CharField()
  password = serializers.CharField()

  def validate(self, data):
    user = authenticate(**data)
    if user and user.is_active:
      return user
    raise serializers.ValidationError("Incorrect Credentials")

################## Pool

class CreatePoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pool
        fields = ('name', 'user_id', 'code')

class PoolSerializer(serializers.ModelSerializer):
    name = serializers.CharField(validators=[])
    class Meta:
        model = Pool
        fields = ('id', 'name', 'user_id', 'created_at')

class UpdatePoolSerializer(serializers.ModelSerializer):
    name = serializers.CharField(validators=[])
    class Meta:
        model = Pool
        fields = ('name')

######################## Leads

class LeadSerializer(serializers.ModelSerializer):
    class Meta:
      model = Lead
      fields = (
        'id', 'company_id', 'company_name', 'title', 'phone', 
        'town', 'town_id', 'group_3', 'group_2', 'group_1',
        'epoch', 'actively_hiring', 'seniority_level', 'job_type',
        'salary', 'number_of_applicants', 'description'
        )

class FilterLeadsSerializer(serializers.ModelSerializer):
  class Meta:
    model = FilterLeads
    fields = (
      'id', 'town_id', 'country_id', 'seniority_level_id', 'job_type_id',
      'job_function_id', 'company_size_id', 'salary_start', 'salary_end',
      'industry_id', 'epoch', 'description'
    )

class HiringManagerSerializer(serializers.ModelSerializer):
    class Meta:
      model = HiringManager
      fields = (
        'id', 'job_id','hiring_manager_id', 
        'hiring_manager', 'hiring_manager_title', 
        'hiring_manager_linkedin', 'hiring_manager_email'
        )

class CompanySerializer(serializers.ModelSerializer):
  class Meta:
    model = Company
    fields = (
      'id', 'industry', 'company_size', 'headquarters',
      'company_type', 'creation_year', 'company_revenue'
    )

class CompanyTownSerializer(serializers.ModelSerializer):
  class Meta:
    model = CompanyTown
    fields = ('id', 'company_id', 'town', 'address', 'phone')

class CompanySpecialtySerializer(serializers.ModelSerializer):
  class Meta:
    model = CompanySpecialty
    fields = ('id', 'company_id', 'specialty')

class CorrPoolUserSerializer(serializers.ModelSerializer):
  class Meta:
    model = CorrPoolUser
    fields = ('id', 'pool_id', 'user_id')

class CorrPoolUnwantedSerializer(serializers.ModelSerializer):
  class Meta:
    model = CorrPoolUnwanted
    fields = ('id', 'pool_id', 'job_id')

class CorrPoolUserJobSerializer(serializers.ModelSerializer):
  class Meta:
    model = CorrPoolUserJob
    fields = ('id', 'pool_id', 'user_id', 'job_id')

class CorrCompanyTownSerializer(serializers.ModelSerializer):
  class Meta:
    model = CorrCompanyTown
    fields = ('id', 'company_id', 'town_id', 'address', 'phone')

######################## Jobs

class CorrJobFunctionSerializer(serializers.ModelSerializer):
    class Meta:
      model = CorrJobFunction
      fields = ('id','job_id', 'job_function_id')

class InventorySerializer(serializers.ModelSerializer):
    class Meta:
      model = JobTypeNorm
      fields = ('id','name')