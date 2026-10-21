<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SubscriptionInvoiceController;

Route::get('/', function () {
    return view('welcome');
});

// Official Subscription Invoice Routes
Route::get('/invoices/subscription/{id}', [SubscriptionInvoiceController::class, 'showInvoice'])->name('subscription.invoice.show');
Route::get('/invoices/subscription/{id}/download', [SubscriptionInvoiceController::class, 'downloadPdf'])->name('subscription.invoice.download');
