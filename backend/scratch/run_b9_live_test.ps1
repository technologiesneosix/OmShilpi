# 1. Login Sessions
$adminSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession;
$adminLoginBody = @{ email = "admin-test@example.com"; password = "StrongTestPassword123!" } | ConvertTo-Json;
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/login" -Method POST -Body $adminLoginBody -ContentType "application/json" -WebSession $adminSession | Out-Null;

$superAdminSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession;
$superAdminLoginBody = @{ email = "superadmin-test@example.com"; password = "StrongTestPassword123!" } | ConvertTo-Json;
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/login" -Method POST -Body $superAdminLoginBody -ContentType "application/json" -WebSession $superAdminSession | Out-Null;

$custSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession;
$custLoginBody = @{ email = "valid-customer-b5@example.com"; password = "ResetPassword789!" } | ConvertTo-Json;
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/login" -Method POST -Body $custLoginBody -ContentType "application/json" -WebSession $custSession | Out-Null;

$staffSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession;
$staffLoginBody = @{ email = "staff-test@example.com"; password = "StrongTestPassword123!" } | ConvertTo-Json;
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/login" -Method POST -Body $staffLoginBody -ContentType "application/json" -WebSession $staffSession | Out-Null;

# 2. Create B9 Test Product
$prodBody = @{ name = "B9 Test Gold Ring"; slug = "b9-test-gold-ring"; sku = "OSJ-B9-GR-001"; price = 50000.00 } | ConvertTo-Json;
$prodRes = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/products" -Method POST -Body $prodBody -ContentType "application/json" -WebSession $adminSession;
$productId = $prodRes.data.product.id;
$productSlug = $prodRes.data.product.slug;

# 3. Create Inventory (Item 1)
$invCreateBody = @{ productId = $productId; quantity = 10; lowStockThreshold = 3 } | ConvertTo-Json;
$invCreateRes = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/inventory" -Method POST -Body $invCreateBody -ContentType "application/json" -WebSession $adminSession;

# 4. Duplicate Inventory (Item 2 - 409 Conflict)
try { Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/inventory" -Method POST -Body $invCreateBody -ContentType "application/json" -WebSession $adminSession } catch { $dupInvErr = $_.ErrorDetails.Message };

# 5. Invalid Product (Item 3 - 404 Not Found)
$invalidProdInvBody = @{ productId = "non-existent-prod-id"; quantity = 10 } | ConvertTo-Json;
try { Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/inventory" -Method POST -Body $invalidProdInvBody -ContentType "application/json" -WebSession $adminSession } catch { $invalidProdErr = $_.ErrorDetails.Message };

# 6. Admin Get Inventory (Item 4)
$adminInvGet = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/inventory/$productId" -Method GET -WebSession $adminSession;

# 7. Unauthenticated Access (Item 5 - 401)
try { Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/inventory/$productId" -Method GET } catch { $unauthErr = $_.ErrorDetails.Message };

# 8. Customer Access & Mutation (Item 6 & 7 - 403)
try { Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/inventory/$productId" -Method GET -WebSession $custSession } catch { $custGetErr = $_.ErrorDetails.Message };
$adjustCustBody = @{ change = 5; reason = "Malicious" } | ConvertTo-Json;
try { Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/inventory/$productId/adjust" -Method PATCH -Body $adjustCustBody -ContentType "application/json" -WebSession $custSession } catch { $custMutErr = $_.ErrorDetails.Message };

# 9. Admin Increase Stock (Item 8: +5 -> 15)
$increaseBody = @{ change = 5; reason = "NEW_STOCK" } | ConvertTo-Json;
$increaseRes = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/inventory/$productId/adjust" -Method PATCH -Body $increaseBody -ContentType "application/json" -WebSession $adminSession;

# 10. Admin Decrease Stock (Item 9: -4 -> 11)
$decreaseBody = @{ change = -4; reason = "STOCK_REDUCTION" } | ConvertTo-Json;
$decreaseRes = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/inventory/$productId/adjust" -Method PATCH -Body $decreaseBody -ContentType "application/json" -WebSession $adminSession;

# 11. Negative Stock Prevention (Item 10: -20 attempt -> 400 Bad Request)
$overdrawAttemptBody = @{ change = -20; reason = "OVERDRAW" } | ConvertTo-Json;
try { Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/inventory/$productId/adjust" -Method PATCH -Body $overdrawAttemptBody -ContentType "application/json" -WebSession $adminSession } catch { $overdrawErr = $_.ErrorDetails.Message };

# 12. Zero Stock (Item 11: -11 -> 0, OUT_OF_STOCK)
$zeroBody = @{ change = -11; reason = "CLEAR_STOCK" } | ConvertTo-Json;
$zeroRes = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/inventory/$productId/adjust" -Method PATCH -Body $zeroBody -ContentType "application/json" -WebSession $adminSession;

# 13. Negative Result Protection (Item 12: -1 attempt at 0 -> 400 Bad Request)
$negAtZeroBody = @{ change = -1; reason = "SUB_ZERO" } | ConvertTo-Json;
try { Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/inventory/$productId/adjust" -Method PATCH -Body $negAtZeroBody -ContentType "application/json" -WebSession $adminSession } catch { $negZeroErr = $_.ErrorDetails.Message };

# 14. Direct Stock Set & Low Stock Check (Item 13, 14, 15, 21)
$setStockBody = @{ quantity = 2; reason = "PHYSICAL_AUDIT" } | ConvertTo-Json;
$setStockRes = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/inventory/$productId/stock" -Method PATCH -Body $setStockBody -ContentType "application/json" -WebSession $adminSession;
$lowStockRes = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/inventory/low-stock" -Method GET -WebSession $adminSession;

# Set to 0 and test Out-of-Stock endpoint
$setZeroBody = @{ quantity = 0; reason = "AUDIT_ZERO" } | ConvertTo-Json;
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/inventory/$productId/stock" -Method PATCH -Body $setZeroBody -ContentType "application/json" -WebSession $adminSession | Out-Null;
$outOfStockRes = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/inventory/out-of-stock" -Method GET -WebSession $adminSession;

# 15. Threshold Update & Invalid Threshold (Item 19 & 20)
$updateConfigBody = @{ lowStockThreshold = 5 } | ConvertTo-Json;
$updateConfigRes = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/inventory/$productId" -Method PATCH -Body $updateConfigBody -ContentType "application/json" -WebSession $adminSession;
$invalidConfigBody = @{ lowStockThreshold = -1 } | ConvertTo-Json;
try { Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/inventory/$productId" -Method PATCH -Body $invalidConfigBody -ContentType "application/json" -WebSession $adminSession } catch { $invalidConfigErr = $_.ErrorDetails.Message };

# 16. Inventory History Audit Log (Item 25)
$historyRes = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/inventory/$productId/history" -Method GET -WebSession $adminSession;

# ===================================================
# 17. MANDATORY CONCURRENCY TEST A (Initial Qty = 10, parallel -5 & -3 => Final Qty = 2)
# ===================================================
# Set stock to 10
$resetTenBody = @{ quantity = 10; reason = "RESET_CONCURRENCY_A" } | ConvertTo-Json;
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/inventory/$productId/stock" -Method PATCH -Body $resetTenBody -ContentType "application/json" -WebSession $adminSession | Out-Null;

$bodyA = @{ change = -5; reason = "PARALLEL_A" } | ConvertTo-Json;
$bodyB = @{ change = -3; reason = "PARALLEL_B" } | ConvertTo-Json;

$taskA = [System.Threading.Tasks.Task]::Run({
  Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/inventory/$productId/adjust" -Method PATCH -Body $bodyA -ContentType "application/json" -WebSession $adminSession
});
$taskB = [System.Threading.Tasks.Task]::Run({
  Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/inventory/$productId/adjust" -Method PATCH -Body $bodyB -ContentType "application/json" -WebSession $adminSession
});

[System.Threading.Tasks.Task]::WaitAll($taskA, $taskB);
$finalInvA = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/inventory/$productId" -Method GET -WebSession $adminSession;
$concurrencyAQty = $finalInvA.data.inventory.quantity;

# ===================================================
# 18. MANDATORY CONCURRENCY OVERDRAW TEST B (Initial Qty = 5, parallel -4 & -4 => 1 succeeds, 1 fails, Final Qty = 1)
# ===================================================
$resetFiveBody = @{ quantity = 5; reason = "RESET_CONCURRENCY_B" } | ConvertTo-Json;
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/inventory/$productId/stock" -Method PATCH -Body $resetFiveBody -ContentType "application/json" -WebSession $adminSession | Out-Null;

$bodyOver1 = @{ change = -4; reason = "PARALLEL_OVER_1" } | ConvertTo-Json;
$bodyOver2 = @{ change = -4; reason = "PARALLEL_OVER_2" } | ConvertTo-Json;

$overdrawFailErr = "";
$taskOver1 = [System.Threading.Tasks.Task]::Run({
  try { Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/inventory/$productId/adjust" -Method PATCH -Body $bodyOver1 -ContentType "application/json" -WebSession $adminSession } catch { $_.ErrorDetails.Message }
});
$taskOver2 = [System.Threading.Tasks.Task]::Run({
  try { Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/inventory/$productId/adjust" -Method PATCH -Body $bodyOver2 -ContentType "application/json" -WebSession $adminSession } catch { $_.ErrorDetails.Message }
});

[System.Threading.Tasks.Task]::WaitAll($taskOver1, $taskOver2);
$over1Res = $taskOver1.Result;
$over2Res = $taskOver2.Result;

$finalInvB = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/inventory/$productId" -Method GET -WebSession $adminSession;
$concurrencyBQty = $finalInvB.data.inventory.quantity;

# 19. Public Availability Check (Item 22)
$publicDetailRes = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/products/$productSlug" -Method GET;

# 20. Clean up Test Product & Inventory
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/products/$productId" -Method DELETE -WebSession $adminSession | Out-Null;

# 21. Regressions (B2-B8)
$regHealth = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/health" -Method GET;
$regCat = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/categories" -Method GET;
$regCol = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/collections" -Method GET;
$regProd = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/products" -Method GET;

Write-Output "=== B9 LIVE VERIFICATION TEST RESULTS ===";
Write-Output "Initial Inv Qty: $($invCreateRes.data.inventory.quantity)";
Write-Output "Duplicate Inv Error: $dupInvErr";
Write-Output "Invalid Product Error: $invalidProdErr";
Write-Output "Admin Get Qty: $($adminInvGet.data.inventory.quantity)";
Write-Output "Unauth Error: $unauthErr";
Write-Output "Customer Get Error: $custGetErr";
Write-Output "Customer Mutate Error: $custMutErr";
Write-Output "Increase (+5) Qty: $($increaseRes.data.inventory.quantity)";
Write-Output "Decrease (-4) Qty: $($decreaseRes.data.inventory.quantity)";
Write-Output "Overdraw (-20) Error: $overdrawErr";
Write-Output "Zero Stock Qty: $($zeroRes.data.inventory.quantity), Availability: $($zeroRes.data.inventory.availability)";
Write-Output "Negative at Zero Error: $negZeroErr";
Write-Output "Direct Set Qty: $($setStockRes.data.inventory.quantity)";
Write-Output "Low Stock Items Count: $($lowStockRes.data.length)";
Write-Output "Out of Stock Items Count: $($outOfStockRes.data.length)";
Write-Output "Threshold Update: $($updateConfigRes.data.inventory.lowStockThreshold)";
Write-Output "Invalid Threshold Error: $invalidConfigErr";
Write-Output "History Log Count: $($historyRes.data.length)";
Write-Output "CONCURRENCY TEST A (Initial 10, -5 & -3): Final Qty = $concurrencyAQty (Expected: 2)";
Write-Output "CONCURRENCY OVERDRAW TEST B (Initial 5, -4 & -4): Final Qty = $concurrencyBQty (Expected: 1)";
Write-Output "Concurrency Overdraw Task1 Output: $over1Res";
Write-Output "Concurrency Overdraw Task2 Output: $over2Res";
Write-Output "Public Product Availability: $($publicDetailRes.data.product.availability)";
Write-Output "Health Regression: $($regHealth.status)";
Write-Output "Categories Regression: $($regCat.success)";
Write-Output "Collections Regression: $($regCol.success)";
Write-Output "Products Regression: $($regProd.success)";
