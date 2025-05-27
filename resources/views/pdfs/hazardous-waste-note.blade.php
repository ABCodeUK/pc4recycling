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
            font-size: 20px;
            font-weight: bold;
            margin: 10px 0;
            color: #2ab99b;
            text-align: left;
            padding: 10px 0;
        }
        .section {
            border: 1px solid #e2e8f0;
            margin-bottom: 15px;
            padding: 10px;
        }
        .cdsection {
            border: 0px solid #e2e8f0;
            margin-bottom: 15px;
            padding: 0px;
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
            font-size: 12px;
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
            margin: 5px 0;
            min-height: 40px;  /* Updated from 60px to ensure consistent height */
            font-size: 11px;
            height: 40px;      /* Added fixed height */
            overflow: hidden;  /* Added to handle overflow */
        }
    </style>
</head>
<body>
    <div class="header-content clearfix">
        <div class="logo-container">
            <img src="{{ public_path('images/logos/pc4-logo.jpg') }}" alt="PC4 Logo" class="logo">
        </div>
        <div class="company-info">
            <strong>PC4Recycling Limited</strong><br>
            Brookfield Industrial Estate<br>
            Tansley, Derbyshire, DE4 5ND<br>
            Waste Permit Number: EXP/LP3547YD
        </div>
    </div>
    
    <!-- Add the document title here, after the header section -->
    <div class="document-title">The Hazardous Waste Regulations 2005: Consignment Note</div>

    <div class="section">
        <div class="section-title">PART A: Notification Details</div>
        <div class="info-group">
            <div class="consignment-code">1. Consignment note code: 
                @php
                    $customerPrefix = strtoupper(substr($customer->company_name ?? $customer->name, 0, 6));
                    $jobNumber = preg_replace('/[^0-9]/', '', $job->job_id);
                    $consignmentCode = $customerPrefix . '/' . $jobNumber;
                @endphp
                {{ $consignmentCode }}
            </div>
        </div>
        
        <table style="border: none; margin-top: 10px; margin-bottom: 0px;">
            <tr>
                <td style="width: 50%; border: none; padding: 0 10px 0 0; vertical-align: top;">
                    <strong>2. The waste described below is to be removed from:</strong>
                    <div class="address-box">
                        {{ $customer->company_name ?? $customer->name }}, {{ $job->address }}@if($job->address_2), {{ $job->address_2 }} @endif, {{ $job->town_city }}, {{ $job->postcode }}
                    </div>
                </td>
                
                <td style="width: 50%; border: none; padding: 0 10px; vertical-align: top;">
                    <strong>3. The collected waste will be taken to:</strong>
                    <div class="address-box">
                        PC4 Recycling Ltd, Brookfield Way, Brookfield Ind Est, Tansley, Derbyshire, DE4 5ND
                    </div>
                </td>
                
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">PART B: Description of the Waste</div>
        
        <p style="font-size: 12px; margin: 10px 0;">WASTE DETAILS (where more than one waste type is collected all of the information given below must be completed for each EWC identified)</p>
        
        <table style="margin-bottom:5px;">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Weight (kg)</th>
                    <th>EWC Code</th>
                    <th>Chemical Component</th>
                    <th>Concentration</th>
                    <th>Physical Form</th>
                    <th>Hazard Code</th>
                    <th>Container Type</th>
                </tr>
            </thead>
            <tbody>
                @php
                    $groupedItems = $items->where('added', 'Collection')->groupBy('category_id');
                    $totalWeight = 0;
                    $totalItems = 0;
                @endphp
                
                @foreach($groupedItems as $categoryId => $categoryItems)
                    @php
                        $firstItem = $categoryItems->first();
                        $category = $firstItem->category;
                        $totalQty = $categoryItems->sum('quantity');
                        $totalItems += $totalQty;
                        
                        $categoryWeight = 0;
                        foreach ($categoryItems as $item) {
                            $itemWeight = $item->subCategory && $item->subCategory->default_weight 
                                ? $item->subCategory->default_weight 
                                : $category->default_weight;
                            $categoryWeight += ($itemWeight * $item->quantity);
                        }
                        
                        $totalWeight += $categoryWeight;
                        $ewcCode = $category->ewcCode ? $category->ewcCode->ewc_code : '';
                        $hpCodes = $category->hpCodes->pluck('hp_code')->implode(', ');
                    @endphp
                    <tr>
                        <td>{{ $totalQty }} {{ $category->name }}{{ $totalQty > 1 && !str_ends_with(strtolower($category->name), 's') ? 's' : '' }}</td>
                        <td>{{ number_format($categoryWeight, 0) }}</td>
                        <td>{{ $ewcCode }}</td>
                        <td>{{ $category->chemical_component }}</td>
                        <td>{{ $category->concentration }}</td>
                        <td>{{ $category->physical_form }}</td>
                        <td>{{ $hpCodes }}</td>
                        <td>{{ $category->container_type }}</td>
                    </tr>
                @endforeach
                
                @if($groupedItems->count() > 1)
                    <tr>
                        <td><strong>Total</strong></td>
                        <td><strong>{{ number_format($totalWeight, 0) }} (kg)</strong></td>
                        <td colspan="6"></td>
                    </tr>
                @endif
            </tbody>
        </table>
        
        <table style="margin-bottom:5px;">
            <thead>
                <tr>
                    <th>EWC Code</th>
                    <th>UN Identification Number</th>
                    <th>Proper Shipping Name</th>
                    <th>UN Class</th>
                    <th>Packaging Group</th>
                </tr>
            </thead>
            <tbody>
                @php
                    $uniqueEwcCodes = $groupedItems->map(function($items) {
                        $firstItem = $items->first();
                        return $firstItem->category->ewcCode ? $firstItem->category->ewcCode->ewc_code : '';
                    })->unique()->filter();
                @endphp
                
                @foreach($uniqueEwcCodes as $ewcCode)
                    <tr>
                        <td>{{ $ewcCode }}</td>
                        <td>3509</td>
                        <td>Packaging discarded, Empty, Uncleaned</td>
                        <td>9</td>
                        <td>Not Assigned</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="cdsection">
        <table style="border: none; margin: 0;">
            <tr>
                <td style="width: 50%;border: none;padding-right: 5px;vertical-align: top;padding: 0px 10px 0px 0;">
                    <div class="section">
                        <div class="section-title">PART C: Carrier's Certificate</div>
                        <p>I certify that I today collected the consignment and that the details in PART A:2, A:4 and B:1 are correct & I have been advised of any specific handling requirements.</p>
                        <div class="signature-box">
                            <p>
                                <strong>Carrier Name:</strong> {{ $job->driver_signature_name ?? 'Not signed' }} <br>
                                <strong>On behalf of:</strong> PC4 Recycling Ltd, Brookfield Way, Brookfield Ind Est, Tansley, Derbyshire, DE4 5ND <br>
                            </p>
                            <p>
                                <strong>Signature:</strong> <br>
                                @if($job->driver_signature_name)
                                <img src="{{ public_path('storage/jobs/' . $job->job_id . '/driver-signature-' . $job->job_id . '.png') }}" alt="Driver Signature" style="max-width: 200px; max-height: 60px;">
                            @else
                                <div class="signature-line"></div>
                            @endif
                            </p>
                            <p>
                                <strong>Driver Name:</strong> {{ $job->driver_signature_name ?? 'Not signed' }} <br>
                                <strong>Date:</strong> {{ $job->collected_at ? $job->collected_at->format('d/m/Y g:i A') : now()->format('d/m/Y g:i A') }}
                            </p>
                        </div>
                    </div>
                </td>
                
                <td style="width: 50%;border: none;padding-left: 5px;vertical-align: top;padding: 0 0 0 10px;">
                    <div class="section">
                        <div class="section-title">PART D: Consignor's Certificate</div>
                        <p>I certify that the information in PART A, B and C has been completed and is correct, that the carrier is registered or exempt and was advised of the appropriate precautionary measures. All of the waste is packaged and labelled correctly and the carrier has been advised of any special handling requirements.</p>
                        <p>I confirm that I have fulfilled my duty to apply the waste hierarchy as required by Regulation 12 of the Waste (England and Wales) Regulations 2011.</p>
                        <div class="signature-box">
                            <p>
                                <strong>Consignors Name:</strong> {{ $job->customer_signature_name ?? 'Not signed' }} <br>
                                <strong>On behalf of:</strong> {{ $customer->company_name ?? $customer->name }}, {{ $job->address }}@if($job->address_2), {{ $job->address_2 }}@endif, {{ $job->town_city }}, {{ $job->postcode }} <br>
                            </p>
                            <p>
                                <strong>Signature:</strong> <br>
                                @if($job->customer_signature_name)
                                <img src="{{ public_path('storage/jobs/' . $job->job_id . '/customer-signature-' . $job->job_id . '.png') }}" alt="Customer Signature" style="max-width: 200px; max-height: 60px;">
                                @else
                                    <div class="signature-line"></div>
                                @endif
                            </p>
                            <p>
                                <strong>Customer Name:</strong> {{ $job->customer_signature_name ?? 'Not signed' }} <br>
                                <strong>Date:</strong> {{ $job->collected_at ? $job->collected_at->format('d/m/Y g:i A') : now()->format('d/m/Y g:i A') }}
                            </p>
                        </div>
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">PART E: Consignee's Certificate</div>
        <p style="font-size: 12px; margin: 10px 0;">1. I certify that waste permit/exempt waste operation number: <strong>NC2/061922/2021</strong> authorises the management of the waste described in PART B at the address given in PART A:3.</p>
        <p style="font-size: 12px; margin: 10px 0;">2. I received this waste at the address given in PART A:3 on: <strong> {{ $job->received_at ? $job->received_at->format('d/m/Y g:i A') : '' }}</p> </strong>
        <p style="font-size: 12px; margin: 10px 0;">3. Vehicle registration no:<strong> {{ $job->vehicle }}</p> </strong>
        <p style="font-size: 12px; margin: 10px 0;">4. Where waste is rejected, please provide details: <strong> No waste rejected </strong></p>

        <div class="signature-box" style="margin-top: 20px;">
            <p style="font-size: 12px;">
                <strong>Facility Staff Name:</strong> {{ $job->staff_signature_name ?? 'Not Yet Signed' }} <br>
                <strong>On behalf of:</strong> PC4 Recycling Ltd, Brookfield Way, Brookfield Ind Est, Tansley, Derbyshire, DE4 5ND <br>
            </p>
            <p style="font-size: 12px;">
                <strong>Signature:</strong> <br>
                @if($job->staff_signature_name)
                    <img src="{{ public_path('storage/jobs/' . $job->job_id . '/staff-signature-' . $job->job_id . '.png') }}" alt="Staff Signature" style="max-width: 200px; max-height: 60px;">
                @else
                    <div class="signature-line"></div>
                @endif
            </p>
            <p style="font-size: 12px;"> 
                <strong>Date:</strong> {{ $job->received_at ? $job->received_at->format('d/m/Y g:i A') : '' }}
            </p>
        </div>
    </div>

    <div class="footer">PC4 Recycling Ltd | Brookfield Way, Brookfield Ind Est, Tansley, DE4 5ND | 0800 970 88 45</div>
</body>
</html>