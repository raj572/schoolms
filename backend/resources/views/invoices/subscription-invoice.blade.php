<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice {{ $invoiceNumber }} - {{ $school->name ?? 'LearnaZ ERP' }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1f2937;
            background-color: #f3f4f6;
            font-size: 13px;
            line-height: 1.5;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        /* Top Action Bar for web view */
        .action-bar {
            background: #111827;
            color: #ffffff;
            padding: 12px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 50;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .action-bar .brand-title {
            font-weight: 700;
            font-size: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            letter-spacing: 0.5px;
        }

        .action-bar .brand-badge {
            background: #2563eb;
            color: #ffffff;
            font-size: 11px;
            padding: 2px 8px;
            border-radius: 9999px;
            text-transform: uppercase;
            font-weight: 600;
        }

        .action-bar .actions {
            display: flex;
            gap: 12px;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            font-size: 13px;
            font-weight: 600;
            border-radius: 6px;
            text-decoration: none;
            cursor: pointer;
            border: none;
            transition: all 0.15s ease-in-out;
        }

        .btn-primary {
            background: #10b981;
            color: #ffffff;
        }
        .btn-primary:hover {
            background: #059669;
        }

        .btn-secondary {
            background: #374151;
            color: #ffffff;
        }
        .btn-secondary:hover {
            background: #4b5563;
        }

        /* Invoice Container */
        .invoice-wrapper {
            max-width: 820px;
            margin: 30px auto;
            background: #ffffff;
            padding: 40px 48px;
            border-radius: 8px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
            position: relative;
        }

        /* For PDF Rendering */
        @if($isPdf)
        body {
            background: #ffffff;
            font-size: 12px;
        }
        .invoice-wrapper {
            margin: 0;
            padding: 24px;
            box-shadow: none;
            max-width: 100%;
            border-radius: 0;
        }
        .action-bar {
            display: none !important;
        }
        @endif

        /* Print Media Query */
        @media print {
            body {
                background: #ffffff;
                color: #000000;
            }
            .action-bar {
                display: none !important;
            }
            .invoice-wrapper {
                margin: 0;
                padding: 20px 24px;
                box-shadow: none;
                border-radius: 0;
                max-width: 100%;
            }
        }

        /* Layout Tables */
        table.layout-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
        }

        table.layout-table td {
            vertical-align: top;
            padding: 0;
        }

        /* Header Elements */
        .company-logo {
            font-size: 26px;
            font-weight: 800;
            color: #1e3a8a;
            letter-spacing: -0.5px;
            text-transform: uppercase;
        }

        .company-sub {
            color: #6b7280;
            font-size: 12px;
            font-weight: 500;
            margin-top: 2px;
        }

        .invoice-title {
            font-size: 24px;
            font-weight: 800;
            color: #111827;
            text-align: right;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .invoice-tagline {
            text-align: right;
            font-size: 11px;
            color: #6b7280;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 2px;
        }

        .paid-badge {
            display: inline-block;
            background: #dcfce7;
            color: #15803d;
            border: 1px solid #86efac;
            padding: 3px 12px;
            border-radius: 9999px;
            font-weight: 700;
            font-size: 12px;
            letter-spacing: 0.5px;
            margin-top: 6px;
        }

        /* Divider */
        .divider {
            height: 2px;
            background: #e5e7eb;
            margin: 20px 0;
        }

        /* Info Section */
        .section-title {
            font-size: 11px;
            font-weight: 700;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-bottom: 6px;
        }

        .party-name {
            font-size: 15px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 4px;
        }

        .party-details {
            font-size: 12px;
            color: #4b5563;
            line-height: 1.6;
        }

        .meta-box {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 12px 16px;
        }

        .meta-row {
            display: table;
            width: 100%;
            margin-bottom: 4px;
        }

        .meta-label {
            display: table-cell;
            font-size: 11px;
            color: #6b7280;
            font-weight: 600;
            width: 45%;
        }

        .meta-val {
            display: table-cell;
            font-size: 12px;
            color: #111827;
            font-weight: 700;
            text-align: right;
        }

        /* Line Items Table */
        table.items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 24px 0 16px 0;
        }

        table.items-table th {
            background: #f8fafc;
            color: #475569;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 10px 12px;
            border-top: 1px solid #e2e8f0;
            border-bottom: 2px solid #cbd5e1;
            text-align: left;
        }

        table.items-table td {
            padding: 14px 12px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 12px;
            vertical-align: top;
        }

        .text-right {
            text-align: right !important;
        }
        .text-center {
            text-align: center !important;
        }

        .item-title {
            font-weight: 700;
            color: #0f172a;
            font-size: 13px;
        }

        .item-desc {
            font-size: 11px;
            color: #64748b;
            margin-top: 3px;
            line-height: 1.4;
        }

        .extension-pill {
            display: inline-block;
            background: #e0f2fe;
            color: #0369a1;
            border: 1px solid #bae6fd;
            font-size: 10px;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
            margin-top: 4px;
        }

        /* Summary Table */
        table.summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
        }

        table.summary-table td {
            padding: 6px 12px;
            font-size: 12px;
        }

        .summary-label {
            color: #64748b;
            font-weight: 500;
            text-align: right;
        }

        .summary-val {
            text-align: right;
            font-weight: 700;
            color: #0f172a;
            width: 130px;
        }

        .total-row td {
            border-top: 2px solid #e2e8f0;
            border-bottom: 2px solid #0f172a;
            padding-top: 10px;
            padding-bottom: 10px;
        }

        .total-row .summary-label {
            font-size: 14px;
            font-weight: 800;
            color: #0f172a;
            text-transform: uppercase;
        }

        .total-row .summary-val {
            font-size: 18px;
            font-weight: 800;
            color: #059669;
        }

        /* Amount in Words Box */
        .words-box {
            background: #f8fafc;
            border-left: 3px solid #2563eb;
            padding: 10px 14px;
            margin-top: 16px;
            font-size: 12px;
            color: #334155;
            border-radius: 0 4px 4px 0;
        }

        /* Payment Transaction Box */
        .payment-info-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px 16px;
            margin-top: 24px;
        }

        /* Signature & Seal Area */
        .sign-area {
            text-align: right;
            margin-top: 36px;
            padding-right: 12px;
        }

        .sign-title {
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 0.5px;
        }

        .sign-name {
            font-size: 13px;
            font-weight: 700;
            color: #0f172a;
            margin-top: 36px;
            border-top: 1px dashed #cbd5e1;
            display: inline-block;
            padding-top: 6px;
        }

        /* Footer */
        .invoice-footer {
            margin-top: 36px;
            padding-top: 16px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            line-height: 1.6;
        }

        .invoice-footer strong {
            color: #64748b;
        }
    </style>
</head>
<body>

    @if(!$isPdf)
    <!-- Web Action Bar -->
    <div class="action-bar">
        <div class="brand-title">
            <span>LEARNAZ SCHOOL ERP</span>
            <span class="brand-badge">Official Invoice</span>
        </div>
        <div class="actions">
            <button onclick="window.print()" class="btn btn-secondary">
                🖨️ Print Invoice
            </button>
            <a href="{{ url('/invoices/subscription/' . $transaction->id . '/download') }}" class="btn btn-primary">
                ⬇️ Download PDF
            </a>
        </div>
    </div>
    @endif

    <div class="invoice-wrapper">

        <!-- Top Header: Logo & Title -->
        <table class="layout-table">
            <tr>
                <td style="width: 55%;">
                    <div class="company-logo">LearnaZ</div>
                    <div class="company-sub">Next-Gen School Management & ERP System</div>
                    <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">
                        Operated by Lazfort Technologies EdTech Suite<br>
                        GSTIN: <strong>29AABCU9603R1Z7</strong> | CIN: U72900KA2024PTC123456<br>
                        Support: <strong>billing@learnaz.lazfort.com</strong> | https://learnaz.lazfort.com
                    </div>
                </td>
                <td style="width: 45%; text-align: right;">
                    <div class="invoice-title">Tax Invoice</div>
                    <div class="invoice-tagline">Subscription Service Receipt</div>
                    <div class="paid-badge">✔ PAYMENT RECEIVED</div>
                    <div style="font-size: 12px; color: #4b5563; margin-top: 8px;">
                        Invoice No: <strong style="color: #111827;">{{ $invoiceNumber }}</strong><br>
                        Date: <strong style="color: #111827;">{{ $invoiceDate }}</strong>
                    </div>
                </td>
            </tr>
        </table>

        <div class="divider"></div>

        <!-- Billed To & Transaction Details -->
        <table class="layout-table">
            <tr>
                <!-- Billed To (School) -->
                <td style="width: 58%; padding-right: 20px;">
                    <div class="section-title">Billed To (School Client)</div>
                    <div class="party-name">{{ $school->name ?? 'School Institution' }}</div>
                    <div class="party-details">
                        @if($school->school_code)
                            <div>School Code: <strong>{{ $school->school_code }}</strong></div>
                        @endif
                        @if($administrator && $administrator->full_name)
                            <div>Attn: <strong>{{ $administrator->full_name }}</strong> (Administrator)</div>
                        @elseif($school->principal_name)
                            <div>Attn: <strong>{{ $school->principal_name }}</strong> (Principal)</div>
                        @endif
                        @if($school->email || ($administrator && $administrator->email))
                            <div>Email: {{ $administrator->email ?? $school->email }}</div>
                        @endif
                        @if($school->phone || ($administrator && $administrator->phone))
                            <div>Phone: {{ $administrator->phone ?? $school->phone }}</div>
                        @endif
                        @if($school->address || $school->city)
                            <div>
                                {{ $school->address ? $school->address . ', ' : '' }}
                                {{ $school->city ? $school->city . ', ' : '' }}
                                {{ $school->state ? $school->state : '' }}
                                {{ $school->pincode ? ' - ' . $school->pincode : '' }}
                            </div>
                        @endif
                    </div>
                </td>

                <!-- Invoice Meta & Payment Details -->
                <td style="width: 42%;">
                    <div class="section-title">Payment Transaction Summary</div>
                    <div class="meta-box">
                        <div class="meta-row">
                            <span class="meta-label">Payment ID:</span>
                            <span class="meta-val" style="font-family: monospace; font-size: 11px;">
                                {{ $transaction->razorpay_payment_id ?? 'MANUAL_ACTIVATION' }}
                            </span>
                        </div>
                        <div class="meta-row">
                            <span class="meta-label">Order ID:</span>
                            <span class="meta-val" style="font-family: monospace; font-size: 11px;">
                                {{ $transaction->razorpay_order_id }}
                            </span>
                        </div>
                        <div class="meta-row">
                            <span class="meta-label">Payment Date:</span>
                            <span class="meta-val">{{ $paymentDate }}</span>
                        </div>
                        <div class="meta-row">
                            <span class="meta-label">Payment Mode:</span>
                            <span class="meta-val">
                                {{ !empty($transaction->payment_method) ? ucfirst($transaction->payment_method) : ($transaction->razorpay_payment_id ? 'Razorpay Online' : 'Manual Entry') }}
                            </span>
                        </div>
                        <div class="meta-row">
                            <span class="meta-label">Payment Status:</span>
                            <span class="meta-val" style="color: #15803d;">Successful</span>
                        </div>
                    </div>
                </td>
            </tr>
        </table>

        <!-- Line Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 6%;">#</th>
                    <th style="width: 48%;">Service / Plan Description</th>
                    <th style="width: 16%;" class="text-center">Billing Cycle</th>
                    <th style="width: 15%;" class="text-right">Unit Rate</th>
                    <th style="width: 15%;" class="text-right">Total (INR)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>
                        <div class="item-title">{{ $transaction->plan_name ?? 'Standard' }} Plan Subscription</div>
                        <div class="item-desc">
                            Complete cloud-based School ERP modules, student attendance, exams, fees & teacher portal.
                            <br>
                            <strong>Coverage Period:</strong> {{ $startDate }} to {{ $endDate }} ({{ $transaction->duration_months ?? 1 }} Month{{ ($transaction->duration_months ?? 1) > 1 ? 's' : '' }})
                        </div>
                        @if($isExtension)
                        <div class="extension-pill">
                            ✔ Subscription Expiry Extended to {{ $endDate }}
                        </div>
                        @endif
                    </td>
                    <td class="text-center" style="text-transform: capitalize; font-weight: 600;">
                        {{ $transaction->billing_cycle ?? 'monthly' }}
                    </td>
                    <td class="text-right">
                        ₹{{ number_format($baseAmount, 2) }}
                    </td>
                    <td class="text-right" style="font-weight: 700;">
                        ₹{{ number_format($baseAmount, 2) }}
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Summary & Calculations -->
        <table class="layout-table" style="margin-bottom: 0;">
            <tr>
                <!-- Left: Notes & In Words -->
                <td style="width: 55%; padding-right: 20px;">
                    <div class="words-box">
                        <strong style="color: #1e3a8a; display: block; font-size: 11px; text-transform: uppercase; margin-bottom: 2px;">
                            Amount in Words:
                        </strong>
                        <em>{{ $amountInWords }}</em>
                    </div>

                    <div style="margin-top: 18px; font-size: 11px; color: #64748b; line-height: 1.5;">
                        <strong style="color: #334155;">Terms & Conditions:</strong>
                        <ul style="padding-left: 14px; margin-top: 4px;">
                            <li>Subscription services are activated immediately and are non-refundable.</li>
                            <li>Payment includes 18% Goods & Services Tax (GST).</li>
                            <li>Continuous service access is guaranteed through {{ $endDate }}.</li>
                        </ul>
                    </div>
                </td>

                <!-- Right: Financial Breakdown -->
                <td style="width: 45%;">
                    <table class="summary-table">
                        <tr>
                            <td class="summary-label">Taxable Subtotal:</td>
                            <td class="summary-val">₹{{ number_format($baseAmount, 2) }}</td>
                        </tr>
                        <tr>
                            <td class="summary-label">CGST (9.0%):</td>
                            <td class="summary-val">₹{{ number_format($cgst, 2) }}</td>
                        </tr>
                        <tr>
                            <td class="summary-label">SGST (9.0%):</td>
                            <td class="summary-val">₹{{ number_format($sgst, 2) }}</td>
                        </tr>
                        <tr class="total-row">
                            <td class="summary-label">Total Amount Paid:</td>
                            <td class="summary-val">₹{{ number_format($totalAmount, 2) }}</td>
                        </tr>
                    </table>

                    <!-- Digital Signature / Stamp -->
                    <div class="sign-area">
                        <div class="sign-title">For LearnaZ EdTech Private Limited</div>
                        <div class="sign-name">Authorized Signatory</div>
                        <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">Electronically Authenticated</div>
                    </div>
                </td>
            </tr>
        </table>

        <!-- Official Footer -->
        <div class="invoice-footer">
            <p><strong>LearnaZ School Management & ERP Suite</strong> • This is a computer-generated tax invoice and requires no physical signature.</p>
            <p>For any queries or billing support, please contact <strong>billing@learnaz.lazfort.com</strong> or visit <strong>https://learnaz.lazfort.com</strong></p>
        </div>

    </div>

</body>
</html>
