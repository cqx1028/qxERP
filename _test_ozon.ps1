$headers = @{
    "Client-Id" = "4076619"
    "Api-Key" = "你的完整ApiKey"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri "https://api-seller.ozon.ru/v1/warehouse-management/list" -Method POST -Headers $headers -TimeoutSec 10
    Write-Host "✅ 连接成功！仓库列表：" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ 连接失败：$($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $status = [int]$_.Exception.Response.StatusCode
        Write-Host "状态码：$status" -ForegroundColor Yellow
    }
}
