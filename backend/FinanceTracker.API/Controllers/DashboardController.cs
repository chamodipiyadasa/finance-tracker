using System.Security.Claims;
using FinanceTracker.API.DTOs;
using FinanceTracker.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    /// <summary>
    /// Get dashboard summary for current user
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<DashboardSummary>>> GetDashboard(
        [FromQuery] int? month,
        [FromQuery] int? year)
    {
        var targetMonth = month ?? DateTime.UtcNow.Month;
        var targetYear = year ?? DateTime.UtcNow.Year;

        var dashboard = await _dashboardService.GetDashboardAsync(UserId, targetMonth, targetYear);

        return Ok(new ApiResponse<DashboardSummary>
        {
            Success = true,
            Message = "Dashboard data retrieved successfully",
            Data = dashboard
        });
    }

    /// <summary>
    /// Get admin dashboard (Admin only)
    /// </summary>
    [HttpGet("admin")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<ApiResponse<AdminDashboard>>> GetAdminDashboard()
    {
        var dashboard = await _dashboardService.GetAdminDashboardAsync();

        return Ok(new ApiResponse<AdminDashboard>
        {
            Success = true,
            Message = "Admin dashboard data retrieved successfully",
            Data = dashboard
        });
    }
}
