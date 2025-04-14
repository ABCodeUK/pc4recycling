<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Collection Manifest</title>
    <style>
        @page { margin: 1.5cm; }
        body {
            font-family: Arial, sans-serif;
            line-height: 1.3;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .header-content {
            margin-bottom: 50px;
        }
        .logo-container {
            float: left;
            width: 360px;
        }
        .company-info {
            float: right;
            text-align: right;
            font-size: 16px;
            line-height: 1.4;
        }
        .logo {
            width: 180px;
        }
        .document-title {
            clear: both;
            font-size: 40px;
            font-weight: bold;
            margin: 20px 0;
            color: #2ab99b;
        }
        .main-content {
            clear: both;
        }
        .left-column {
            float: left;
            width: 60%;
        }
        .right-column {
            float: right;
            width: 35%;
            text-align: right;
        }
        .info-group {
            margin-bottom: 10px;
        }
        .info-group strong {
            display: inline-block;
        }
        .address-line {
            display: block;
            margin-left: 0;
        }
        table {
            clear: both;
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th {
            background-color: #2ab99b;
            color: white;
            padding: 8px;
            text-align: left;
            font-size: 12px;
        }
        td {
            padding: 8px;
            border: 1px solid #e2e8f0;
            font-size: 12px;
        }
        .center {
            text-align: center;
        }
        .signatures {
            clear: both;
            margin-top: 40px;
        }
        .signature-box {
            float: left;
            width: 45%;
        }
        .signature-box:last-child {
            float: right;
        }
        .signature-line {
            margin: 25px 0 5px 0;
        }
        .footer {
            position: fixed;
            width:100%;
            left: 0;
            bottom: 5px;
            right: 0;
            text-align: center;
            font-size: 12px;
            overflow:auto;
        }
        .clearfix:after {
            content: "";
            display: table;
            clear: both;
        }
    </style>
</head>
<body>
    <div class="header-content clearfix">
        <div class="logo-container">
            <img src="{{ public_path('images/logos/pc4-logo.jpg') }}" alt="PC4 Logo" class="logo">
        </div>
        <div class="company-info">
           <strong>PC4Recycling LTD</strong><br>
            Brookfield Industrial Estate<br>
            Tansley, Derbyshire, DE4 5ND
        </div>
    </div>

    <div class="document-title">Collection Manifest</div>

    <div class="main-content clearfix">
        <div class="left-column">
            <div class="info-group"><strong>Customer:</strong><br>{{ $customer->company_name ?? $customer->name }}</div>
            <div class="info-group">
                <strong>Collection Address:</strong>
                <span class="address-line">{{ $job->address }}@if($job->address_2), {{ $job->address_2 }} @endif</span>
                <span class="address-line">{{ $job->town_city }}, {{ $job->postcode }}</span>
            </div>
            <div class="info-group">
                <strong>On Site Contact:</strong><br>{{ $job->onsite_contact }} - ({{ $job->onsite_number }})</div>
        </div>
        <div class="right-column">
            <div class="info-group">
                <strong>Collection Date:</strong><br>{{ $job->collection_date ? date('d/m/Y', strtotime($job->collection_date)) : 'TBC' }}</div>
            <div class="info-group">
                <strong>Job Number:</strong><br>{{ $job->job_id }}</div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Item #</th>
                <th class="center">QTY</th>
                <th>Category</th>
                <th>Item/s</th>
                <th class="center">Data Erasure</th>
                <th class="center">Collected</th>
            </tr>
        </thead>
        <tbody>
            @foreach($items as $item)
            <tr>
                <td>{{ $item->item_number }}</td>
                <td class="center">{{ $item->quantity }}</td>
                <td>
                    @if($item->category)
                        {{ $item->category->name }}
                    @endif
                </td>
                <td>
                    @if($item->make || $item->model)
                        {{ $item->make }} {{ $item->model }}
                    @endif
                </td>
                <td class="center">{{ $item->erasure_required ?? 'Unknown' }}</td>
                <td class="center"> YES </td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <style>
        .signature-box {
            float: left;
            width: 30%;
            margin-right: 3%;
        }
        .signature-box:last-child {
            float: right;
            margin-right: 0;
        }
        .signature-details {
            margin-top: 10px;
        }
        .signature-field {
            display: inline-block;
            min-width: 150px;
            border-bottom: 1px solid #000;
            margin-left: 10px;
        }
    </style>

    <div class="signatures">
        <div class="signature-box">
            <p>Client Signature:</p>
            @if(Storage::disk('public')->exists("jobs/{$job->job_id}/customer-signature-{$job->job_id}.png"))
                <img src="{{ public_path("storage/jobs/{$job->job_id}/customer-signature-{$job->job_id}.png") }}" 
                     alt="Customer Signature" 
                     style="max-width: 200px;">
            @endif
            <div class="signature-details">
                <p>Name: {{ $job->customer_signature_name }}</p>
                <p>Date: {{ $job->collected_at ? date('d/m/Y', strtotime($job->collected_at)) : '' }}</p>
            </div>
        </div>

        <div class="signature-box">
            <p>Driver Signature:</p>
            @if(Storage::disk('public')->exists("jobs/{$job->job_id}/driver-signature-{$job->job_id}.png"))
                <img src="{{ public_path("storage/jobs/{$job->job_id}/driver-signature-{$job->job_id}.png") }}" 
                     alt="Driver Signature" 
                     style="max-width: 200px;">
            @endif
            <div class="signature-details">
                <p>Name: {{ $job->driver_signature_name }}</p>
                <p>Date: {{ $job->collected_at ? date('d/m/Y', strtotime($job->collected_at)) : '' }}</p>
            </div>
        </div>

        <!-- Add staff signature section -->
        @if($job->staff_signature_name)
        <div class="signature-box">
            <p>Received By:</p>
            @if(Storage::disk('public')->exists("jobs/{$job->job_id}/staff-signature-{$job->job_id}.png"))
                <img src="{{ public_path("storage/jobs/{$job->job_id}/staff-signature-{$job->job_id}.png") }}" 
                     alt="Staff Signature" 
                     style="max-width: 200px;">
            @endif
            <div class="signature-details">
                <p>Name: {{ $job->staff_signature_name }}</p>
                <p>Date: {{ $job->received_at ? date('d/m/Y', strtotime($job->received_at)) : '' }}</p>
            </div>
        </div>
        @endif
    </div>

    <div class="footer">REGISTERED IN ENGLAND & WALES. REGISTRATION NO. 10498346. VAT NO. 257896833</div>
</body>
</html>