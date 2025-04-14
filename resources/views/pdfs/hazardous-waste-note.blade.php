<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Hazardous Waste Note</title>
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
            margin-bottom: 20px;
        }
        .logo-container {
            float: left;
            width: 33%;
        }
        .title-container {
            float: left;
            width: 33%;
            text-align: center;
        }
        .ea-logo-container {
            float: right;
            width: 33%;
            text-align: right;
        }
        .logo {
            width: 180px;
        }
        .document-title {
            clear: both;
            font-size: 24px;
            font-weight: bold;
            margin: 10px 0;
            color: #2ab99b;
            text-align: center;
            padding: 10px 0;
        }
        .section {
            border: 1px solid #e2e8f0;
            margin-bottom: 15px;
            padding: 10px;
        }
        .section-title {
            font-weight: bold;
            background-color: #2ab99b;
            color: white;
            padding: 8px;
            margin: -10px -10px 10px -10px;
            font-size: 12px;
        }
        table {
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
        .consignment-code {
            font-size: 16px;
            font-weight: bold;
            margin: 10px 0;
        }
        .signature-box {
            margin-bottom: 15px;
        }
        .signature-line {
            border-bottom: 1px solid #000;
            width: 200px;
            margin: 25px 0 5px 0;
        }
        .footer {
            position: fixed;
            width: 100%;
            left: 0;
            bottom: 5px;
            right: 0;
            text-align: center;
            font-size: 12px;
            overflow: auto;
        }
        .clearfix:after {
            content: "";
            display: table;
            clear: both;
        }
        .center {
            text-align: center;
        }
        .info-group {
            margin-bottom: 10px;
        }
        .info-group strong {
            display: inline-block;
        }
        .address-box {
            border: 1px solid #e2e8f0;
            padding: 8px;
            margin: 5px 0 10px 0;
            min-height: 40px;
        }
    </style>
</head>
<body>
    <div class="header-content clearfix">
        <div class="logo-container">
            <img src="{{ public_path('images/logos/pc4-logo.jpg') }}" alt="PC4 Logo" class="logo">
        </div>
        <div class="title-container">
            <!-- Remove the title from here -->
        </div>
        <div class="ea-logo-container">
            <img src="{{ public_path('images/logos/environment-agency.jpg') }}" alt="Environment Agency Logo" class="logo">
        </div>
    </div>
    
    <!-- Add the document title here, after the header section -->
    <div class="document-title">The Hazardous Waste Regulations 2005: Consignment Note</div>

    <div class="section">
        <div class="section-title">PART A: Notification Details</div>
        <div class="info-group">
            <div class="consignment-code">1. Consignment note code: {{ $job->job_id }}</div>
        </div>
        <div class="info-group">
            <strong>2. The waste described below is to be removed from:</strong>
            <div class="address-box">
                {{ $customer->company_name ?? $customer->name }}<br>
                {{ $job->address }}@if($job->address_2), {{ $job->address_2 }} @endif<br>
                {{ $job->town_city }}, {{ $job->postcode }}
            </div>
        </div>
        <div class="info-group">
            <strong>3. The waste will be taken to:</strong>
            <div class="address-box">
                PC4 Recycling, Brookfield Way, Brookfield Ind Est<br>
                Tansley, Derbyshire, DE4 5ND<br>
                Waste Permit Number: NC2/061922/2021
            </div>
        </div>
        <div class="info-group">
            <strong>4. The waste producer was (if different from 2):</strong>
            <div class="address-box"></div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">PART B: Description of the Waste</div>
        <table>
            <thead>
                <tr>
                    <th>Description of Waste</th>
                    <th>EWC Code</th>
                    <th>Quantity (kg)</th>
                    <th>Chemical Component</th>
                    <th>Concentration</th>
                    <th>Physical Form</th>
                    <th>Hazard Code</th>
                    <th>Container Type</th>
                </tr>
            </thead>
            <tbody>
                @php
                    // Group items by category
                    $groupedItems = $items->groupBy('category_id');
                    $totalWeight = 0;
                @endphp
                
                @foreach($groupedItems as $categoryId => $categoryItems)
                    @php
                        // Get the first item to access its category
                        $firstItem = $categoryItems->first();
                        $category = $firstItem->category;
                        
                        // Calculate total count and weight for this category
                        $itemCount = $categoryItems->count();
                        
                        // Calculate weight based on default_weight × count
                        $categoryWeight = $category->default_weight * $itemCount;
                        $totalWeight += $categoryWeight;
                        
                        // Get EWC code from the category's relationship
                        $ewcCode = $category->ewcCode ? $category->ewcCode->ewc_code : '';
                        
                        // Get HP codes as a comma-separated string
                        $hpCodes = $category->hpCodes->pluck('hp_code')->implode(', ');
                    @endphp
                    <tr>
                        <td>{{ $itemCount }} {{ $category->name }}</td>
                        <td>{{ $ewcCode }}</td>
                        <td>{{ number_format($categoryWeight, 2) }} kg</td>
                        <td>{{ $category->chemical_component }}</td>
                        <td>{{ $category->concentration }}</td>
                        <td>{{ $category->physical_form }}</td>
                        <td>{{ $hpCodes }}</td>
                        <td>{{ $category->container_type }}</td>
                    </tr>
                @endforeach
                
                @if($groupedItems->count() > 1)
                    <tr>
                        <td colspan="2"><strong>Total</strong></td>
                        <td><strong>{{ number_format($totalWeight, 2) }} kg</strong></td>
                        <td colspan="5"></td>
                    </tr>
                @endif
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">PART C: Carrier's Certificate</div>
        <p>I certify that I today collected the consignment and that the details in A2, A4 and B1 are correct & I have been advised of any specific handling requirements.</p>
        <div class="signature-box">
            <p><strong>Carrier Name:</strong> PC4 Recycling</p>
            @if($job->staff_signature_name)
                <img src="{{ public_path('storage/jobs/' . $job->job_id . '/staff-signature-' . $job->job_id . '.png') }}" alt="Staff Signature" style="max-width: 200px; max-height: 60px;">
            @else
                <div class="signature-line"></div>
            @endif
            <p><strong>On behalf of:</strong> PC4 Recycling LTD</p>
            <p><strong>Name:</strong> {{ $job->staff_signature_name ?? 'Not signed' }}</p>
            <p><strong>Date:</strong> {{ now()->format('d/m/Y') }}</p>
        </div>
    </div>

    <div class="section">
        <div class="section-title">PART D: Consignor's Certificate</div>
        <p>I certify that the information in A, B and C above is correct, that the carrier is registered or exempt and was advised of the appropriate precautionary measures.</p>
        <div class="signature-box">
            <div class="signature-line"></div>
            <p><strong>On behalf of:</strong> {{ $customer->company_name ?? $customer->name }}</p>
            <p><strong>Date:</strong> {{ now()->format('d/m/Y') }}</p>
        </div>
    </div>

    <div class="section">
        <div class="section-title">PART E: Consignee's Certificate</div>
        <table>
            <tr>
                <td style="width: 50%">
                    <p><strong>1. I received this waste at the address given in A4 on:</strong></p>
                    <p><strong>2. Vehicle registration no. (or mode of transport if not road):</strong></p>
                    <p><strong>3. Where waste is rejected, please provide details:</strong></p>
                </td>
                <td style="width: 50%">
                    <p><strong>I certify that waste permit/exempt waste operation number:</strong></p>
                    <div class="signature-line"></div>
                    <p><strong>Signature:</strong></p>
                    <p><strong>Date:</strong> {{ now()->format('d/m/Y') }}</p>
                </td>
            </tr>
        </table>
    </div>

    <div class="footer">PC4 Recycling Ltd | Brookfield Way, Brookfield Ind Est, Tansley, DE4 5ND | 0800 970 88 45</div>
</body>
</html>