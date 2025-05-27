<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Data Erasure/Destruction Certificate</title>
    <style>
        @page { 
            margin: 1.5cm;
            size: landscape;
        }
        body {
            font-family: Arial, sans-serif;
            line-height: 1.3;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .header-content {
            margin-bottom: 30px;
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
            font-size: 24px;
            font-weight: bold;
            margin: 20px 0;
            color: #2ab99b;
            text-align: center;
        }
        .certificate-info {
            margin: 20px 0;
            font-size: 14px;
            line-height: 1.6;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            page-break-inside: auto;
        }
        tr {
            page-break-inside: avoid;
            page-break-after: auto;
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
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 12px;
            padding: 10px;
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

    <div class="document-title">DATA ERASURE/DESTRUCTION CERTIFICATE</div>

    <div class="certificate-info">
        <strong>COLLECTION ID:</strong> {{ $job->job_id }}<br>
        <strong>CLIENT:</strong> {{ $customer->company_name ?? $customer->name }}
    </div>

    <p>WE HEREBY CERTIFY that PC4 Recycling has executed on the drives or devices listed below a software or firmware procedure to securely erase the full storage capacity of the devices. After successful completion of the erasure procedure for every device, an encrypted digital certification containing the same information stated below was stored in our database for eventual auditing.</p>

    @php
        $groupedItems = $items->where('erasure_required', 'Yes')->groupBy('category.name');
    @endphp

    @foreach($groupedItems as $categoryName => $categoryItems)
        <div style="margin-top: 20px;">
            <strong>Product Type: {{ $categoryName }}</strong>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>Item ID</th>
                    <th>Asset Tag</th>
                    <th>Serial Number</th>
                    <th>Method</th>
                    <th>TimeStamp</th>
                </tr>
            </thead>
            <tbody>
                @foreach($categoryItems as $item)
                    <tr>
                        <td>{{ $item->item_number }}</td>
                        <td>{{ $item->asset_tag ?? '' }}</td>
                        <td>{{ $item->serial_number ?? '' }}</td>
                        <td>{{ $item->processing_data_status ?? '' }}</td>
                        <td>{{ $item->erasure_timestamp ? date('Y/m/d H:i:s', strtotime($item->erasure_timestamp)) : '' }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    
        <div style="margin-bottom: 10px;">
            Device count: {{ $categoryItems->count() }}
        </div>
    @endforeach

    <div style="margin-top: 20px;">
        Collection Count: {{ $items->where('erasure_required', 'Yes')->count() }}
    </div>

    <div class="footer">
        PC4 Recycling Ltd | Company Registration: 123456 | Waste Permit Number: NC2/061922/2021
    </div>
</body>
</html>