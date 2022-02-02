from django.shortcuts import render
from rest_framework import generics, status
from .serializers import * 
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse
from django.forms.models import model_to_dict

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from rest_framework import generics, permissions
from knox.models import AuthToken

from django.contrib.auth.models import User

from .models import *

import time
import importlib
import requests
from datetime import datetime
import boto3
import json

def get_dim_model_name(feature):
    splited_feature = feature.split('_')
    splited_feature_cap = [word.capitalize() for word in splited_feature]
    model_name = ''.join(splited_feature_cap)
    return model_name

def get_model(feature):

    models_ = {
        'job_type': JobTypeNorm,
        'job_function': JobFunctionNorm,
        'seniority_level': SeniorityLevelNorm,
        'industry': Industry
    }

    return models_[feature]


# Register API
class RegisterAPI(generics.GenericAPIView):
  serializer_class = RegisterSerializer

  def post(self, request, *args, **kwargs):
    serializer = self.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    return Response({
      "user": UserSerializer(user, context=self.get_serializer_context()).data,
      "token": AuthToken.objects.create(user)[1]
    })

# Login API
class LoginAPI(generics.GenericAPIView):
  serializer_class = LoginSerializer

  def post(self, request, *args, **kwargs):
    serializer = self.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.validated_data
    _, token = AuthToken.objects.create(user)
    return Response({
      "user": UserSerializer(user, context=self.get_serializer_context()).data,
      "token": token
    })

# Get User API
class UserAPI(generics.RetrieveAPIView):
  permission_classes = [
    permissions.IsAuthenticated,
  ]
  serializer_class = UserSerializer

  def get_object(self):
    return self.request.user


class CreatePool(APIView):

    def post(self, request, format=None):

        # Check if the data sent if valid
        serializer = CreatePoolSerializer(data=request.data)
        if serializer.is_valid():

            name = serializer.data.get('name')
            code = serializer.data.get('code')
            user_id = serializer.data.get('user_id')

            queryset = Pool.objects.filter(name=name)

            if queryset.exists():
                return Response({'Bad Request': 'Pool name is  already taken.'}, status=status.HTTP_400_BAD_REQUEST)

            else:
                pool = Pool(name=name, user_id=user_id, code=code)
                pool.save()
                pool_data = PoolSerializer(pool).data

                # This user, in this current session, is in this pool
                self.request.session['name'] = name
                
                return Response(pool_data, status=status.HTTP_201_CREATED)

        else:
            return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)

class PoolView(generics.ListAPIView):
    queryset = Pool.objects.all()
    serializer_class = PoolSerializer


class GetPool(APIView):

    def post(self, request, format=None):

        def serialize_objects(objects, serializer):
            return [serializer(object_).data for object_ in objects]

        def from_model_to_data(model, serializer):
            objects = model.objects.all()
            data = serialize_objects(objects, serializer)
            return data

        def get_dim_values(feature, leads):

            dim_model = get_model(feature)
            dim_table = from_model_to_data(dim_model, InventorySerializer)

            # Filter dim from leads
            names_from_values = [lead[feature] for lead in leads]
            dim_table = [dim for dim in dim_table if dim['name'] in names_from_values]

            return dim_table

        serializer = PoolSerializer(data=request.data)
        if serializer.is_valid():

            name = serializer.data.get('name')
            user_id = serializer.data.get('user_id') 

            # Check if a pool code was passed
            if name != None:

                # Check if a pool is linked to the name
                pool = Pool.objects.filter(name=name)

                if len(pool) > 0:
                    # Check if the user is also the admin
                    is_admin = user_id == pool[0].user_id

                    # Get leads and filter leads data

                    with open('api/data/leads.json') as json_file:
                        leads = json.load(json_file)

                    with open('api/data/filter_leads.json') as json_file:
                        filter_leads = json.load(json_file)
                    
                    # Remove unwanted leads

                    pool_id = pool[0].id
                    corr_unwanted_leads = CorrPoolUnwanted.objects.filter(pool_id=pool_id)
                    corr_unwanted_leads_data = serialize_objects(corr_unwanted_leads, CorrPoolUnwantedSerializer)
                    unwanted_leads_ids = [corr['job_id'] for corr in  corr_unwanted_leads_data]

                    leads = [lead for lead in leads if lead['id'] not in unwanted_leads_ids]
                    filter_leads = [filter_ for filter_ in filter_leads if filter_['id'] not in unwanted_leads_ids]

                    # Add is_my_lead

                    corr_pool_user_job = CorrPoolUserJob.objects.filter(pool_id=pool_id, user_id=user_id)
                    corr_pool_user_job_data = serialize_objects(corr_pool_user_job, CorrPoolUserJobSerializer)
                    my_leads = [corr['job_id'] for corr in corr_pool_user_job_data]

                    for i in range(len(leads)):
                        leads[i]['is_my_lead'] = True if leads[i]['id'] in my_leads else False

                    for i in range(len(filter_leads)):
                        filter_leads[i]['is_my_lead'] = True if filter_leads[i]['id'] in my_leads else False

                    # Import dims
                    dim_job_function = get_dim_values('job_function', leads)
                    dim_job_type = get_dim_values('job_type', leads)
                    dim_seniority_level = get_dim_values('seniority_level', leads)
                    dim_industry = get_dim_values('industry', leads)

                    # Gather data

                    data = {
                        'pool_name': name,
                        'pool_id': pool_id,
                        'is_admin': is_admin,
                        'leads_data' : {
                            'leads': leads, 
                            'filter_leads': filter_leads,
                            'dim': {
                                'dim_job_function': dim_job_function,
                                'dim_job_type': dim_job_type,
                                'dim_seniority_level': dim_seniority_level,
                                'dim_industry': dim_industry
                            }
                        }
                    }

                    return Response(data, status=status.HTTP_200_OK)

                else:
                    return Response(
                        {'Pool Not Found': 'Invalid Pool Name'},
                        status=status.HTTP_404_NOT_FOUND
                )

            else:
                return Response (
                    {'Bad Request': 'Pool name parameter not found in request'},
                    status=status.HTTP_400_BAD_REQUEST
                )


class JoinPool(APIView):

    def post(self, request, format=None):

        name = request.data.get('name')
        code = request.data.get('code')

        queryset = Pool.objects.filter(name=name, code=code)
        if queryset.exists():
            pool = queryset[0]

            # This user, in this current session, is in this pool
            self.request.session['name'] = name

            return Response(
                {'message': 'Pool joined!'},
                status=status.HTTP_200_OK
            )
        return Response(
            {'Bad Request': 'Invalid Pool Code'},
            status=status.HTTP_400_BAD_REQUEST
        )

class LeavePool(APIView):
    def post(self, request, format=None):
        if 'name' in self.request.session:

            # Remove the name from user session
            self.request.session.pop('name')

        return Response({'Message': 'Success'}, status=status.HTTP_200_OK)

class UserInPool(APIView):

    def get(self, request, format=None):

        data = {
            'name': self.request.session.get('name'),
            'user_id': self.request.session.get('user_id'),
        }

        return JsonResponse(data, status=status.HTTP_200_OK)

class UpdatePool(APIView):

    serializer_class = UpdatePoolSerializer

    def patch(self, request, format=None):

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():

            name = serializer.data.get('name')
            user_id = serializer.data.get('user_id')

            queryset = Pool.objects.filter(name=name)
            if not queryset.exists():
                return Response(
                    {'Message': 'Pool not found.'},
                    status=status.HTTP_404_NOT_FOUND
                )

            pool = queryset[0]
            if pool.user_id != user_id:
                return Response(
                    {'Message': 'You are not the admin.'},
                    status=status.HTTP_403_FORBIDDEN
                    )
            pool.name = name
            pool.save(update_fields=['name'])
            return Response(PoolSerializer(pool).data, status=status.HTTP_200_OK)

        return Response(
            {'Bad Request': 'Invalid Data'},
            status=status.HTTP_400_BAD_REQUEST
        )

class RemoveJob(APIView):

    def post(self, request, format=None):

        serializer = CorrPoolUnwantedSerializer(data=request.data)
        if serializer.is_valid():

            pool_id = serializer.data.get('pool_id')
            job_id = serializer.data.get('job_id')

            new_entry = CorrPoolUnwanted(pool_id=pool_id, job_id=job_id)
            new_entry.save()
            
            return Response(
                {'Success': 'Job deleted from pool'},
                status=status.HTTP_200_OK
            )

class UpdateCorrPoolUserJob(APIView):

    def post(self, request, format=None):

        pool_id = request.data.get('pool_id')
        user_id = request.data.get('user_id')
        job_id = request.data.get('job_id')
        isMyLead = request.data.get('isMyLead')

        if isMyLead:
            new_entry = CorrPoolUserJob(pool_id=pool_id, user_id=user_id, job_id=job_id)
            new_entry.save()
            return Response(
                {'Success': 'Saved as my lead'},
                status=status.HTTP_200_OK
            )
        else:
            instance = CorrPoolUserJob.objects.get(pool_id=pool_id, user_id=user_id, job_id=job_id)
            instance.delete()
            return Response(
                {'Success': 'Deleted from my leads'},
                status=status.HTTP_200_OK
            )

class HandlePhone(APIView):

    def post(self, request, format=None):

        def get_place_search_results(company, town, key):

            info = {}

            start_url = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input='
            arguments = '&inputtype=textquery&fields=formatted_address,place_id'
            gmaps_url = start_url + company + '%20' + town + arguments + '&key=' + key

            response = requests.get(gmaps_url)
            text = response.json()

            # Try to get place_id (and address)
            if text['status'] == 'OK':
                data = text['candidates']

                if len(data) == 1:
                    data = data[0]

                    info['place_id'] = data['place_id']

                    if 'formatted_address' in data:
                        info['address'] = data['formatted_address']

                    return info

        def get_place_details_results(place_id, key):

            start_url = 'https://maps.googleapis.com/maps/api/place/details/json?place_id='
            arguments = '&fields=formatted_phone_number'
            gmaps_url = start_url + place_id + arguments + '&key=' + key

            response = requests.get(gmaps_url)
            text = response.json()

            if text['status'] == 'OK':
                try:
                    phone = text['result']['formatted_phone_number']
                    return phone
                except:
                    pass

        town_id = request.data.get('town_id')
        town = request.data.get('town')
        company_id = request.data.get('company_id')
        company = request.data.get('company')

        # Rework town
        if ',' in town:
            town = town.split(',')[0]

        # Check if marked as unavailable
        queryset = CorrCompanyTown.objects.filter(company_id=company_id, town_id=town_id)
        if queryset.exists():
            entry = queryset[0]
            if entry.phone == -1:
                return Response(
                    {'phone': 'Unavailable'}, 
                    status=status.HTTP_200_OK
                )
                
        # Try to get it with Google Maps
        gmaps_key = 'AIzaSyB4PEh0YyQqwXA6Q32rYmEVFsZIVAgB3G8'

        place_search_result = get_place_search_results(company, town, gmaps_key)
        if place_search_result:
            place_details_result = get_place_details_results(place_search_result['place_id'], gmaps_key)
            if get_place_details_results:

                phone = place_details_result

                # Update DB

                if queryset.exists():

                    entry.phone = phone

                    if 'address' in place_search_result:
                        entry.address = place_search_result['address']

                    entry.save()

                else:
                    if 'address' in place_search_result:
                        new_entry = CorrCompanyTown(
                            company_id=company_id, town_id=town_id, phone=phone, address=place_search_result['address'])
                    else:
                        new_entry = CorrCompanyTown(company_id=company_id, town_id=town_id, phone=phone)
                    new_entry.save()

                return Response(
                    {'phone': phone}, 
                    status=status.HTTP_200_OK
                )

        # Mark as unavailable

        if queryset.exists():

            entry.phone = -1
            entry.save()

        else:
            new_entry = CorrCompanyTown(company_id=company_id, town_id=town_id, phone=-1)
            new_entry.save()
    
        return Response(
            {'phone': 'Ununvailable'}, 
            status=status.HTTP_200_OK
        )
