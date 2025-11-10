"""
URL configuration for accountflow project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from backend.views import (
  AddressList,
  AddressDetail,
  CompanyList,
  CompanyDetail,
  BillingPlanList,
  BillingPlanDetail,
  BillingAccountList,
  BillingAccountDetail,
  BillingAccountListDetail,
  PresetList,
  PresetDetail,
  TitleList,
  TitleDetail,
  EntryList,
  EntryDetail,
  LogoutView,
)
from rest_framework.authtoken import views as authtoken_views


urlpatterns = [
    path('auth/signin', authtoken_views.obtain_auth_token, name='signin'),
    path('auth/logout', LogoutView.as_view(), name='logout'),
    path('address/', AddressList.as_view(), name='address-list'),
    path('address/<uuid:pk>/', AddressDetail.as_view(), name='address-detail'),
    path('company/', CompanyList.as_view(), name='company-list'),
    path('company/<uuid:pk>/', CompanyDetail.as_view(), name='company-detail'),
    path('billing-plan/', BillingPlanList.as_view(), name='billing-plan-list'),
    path('billing-plan/<uuid:pk>/', BillingPlanDetail.as_view(), name='billing-plan-detail'),
    path('billing-account/', BillingAccountList.as_view(), name='billing-account-list'),
    path('billing-account/<uuid:pk>/', BillingAccountDetail.as_view(), name='billing-account-detail'),
    path(
        'billing-account/by-plan/<uuid:pk>/',
        BillingAccountListDetail.as_view(),
        name='billing-account-by-plan'
    ),
    path('preset/', PresetList.as_view(), name='preset-list'),
    path('preset/<uuid:pk>/', PresetDetail.as_view(), name='preset-detail'),
    path('title/', TitleList.as_view(), name='title-list'),
    path('title/<uuid:pk>/', TitleDetail.as_view(), name='title-detail'),
    path('titles/<uuid:title_id>/entries/', EntryList.as_view(), name='entry-list'),
    path('entries/<uuid:pk>/', EntryDetail.as_view(), name='entry-detail')
]
