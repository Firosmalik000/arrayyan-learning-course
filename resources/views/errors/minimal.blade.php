@extends('errors.layout')

@section('title', $message ?? 'Kendala Halaman')
@section('code', isset($exception) ? $exception->getStatusCode() : '500')
@section('message', $message ?? 'Terjadi kendala pada sistem. Silakan muat ulang halaman atau kembali ke beranda.')
