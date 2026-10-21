<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SubscriptionInvoiceController;

Route::get('/', function () {
    return view('welcome');
});

// Official Subscription Invoice Routes
Route::get('/invoices/subscription/{id}', [SubscriptionInvoiceController::class, 'showInvoice'])->name('subscription.invoice.show');
Route::get('/invoices/subscription/{id}/download', [SubscriptionInvoiceController::class, 'downloadPdf'])->name('subscription.invoice.download');

// Official School Operation Documents
use App\Http\Controllers\SchoolDocumentController;

Route::prefix('documents')->group(function () {
    Route::get('/fee-receipt/{id?}', [SchoolDocumentController::class, 'feeReceipt'])->name('documents.fee-receipt');
    Route::get('/admission-receipt/{studentId?}', [SchoolDocumentController::class, 'admissionReceipt'])->name('documents.admission-receipt');
    Route::get('/marksheet/{studentId?}', [SchoolDocumentController::class, 'marksheet'])->name('documents.marksheet');
    Route::get('/admit-card/{studentId?}', [SchoolDocumentController::class, 'admitCard'])->name('documents.admit-card');
    Route::get('/transfer-certificate/{studentId?}', [SchoolDocumentController::class, 'transferCertificate'])->name('documents.transfer-certificate');
    Route::get('/id-card/{studentId?}', [SchoolDocumentController::class, 'idCard'])->name('documents.id-card');
    Route::get('/bonafide-certificate/{studentId?}', [SchoolDocumentController::class, 'bonafideCertificate'])->name('documents.bonafide-certificate');
});
