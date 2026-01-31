using System.Security.Claims;
using FinanceTracker.API.DTOs;
using FinanceTracker.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BudgetsController : ControllerBase
{
    private readonly IBudgetService _budgetService;

    public BudgetsController(IBudgetService budgetService)
    {
        _budgetService = budgetService;
    }

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    /// <summary>
    /// Get current month's budget
    /// </summary>
    [HttpGet("current")]
    public async Task<ActionResult<ApiResponse<BudgetDto>>> GetCurrentBudget()
    {
        var budget = await _budgetService.GetCurrentBudgetAsync(UserId);

        return Ok(new ApiResponse<BudgetDto>
        {
            Success = true,
            Message = budget != null ? "Budget retrieved successfully" : "No budget set for current month",
            Data = budget
        });
    }

    /// <summary>
    /// Get budget for a specific month
    /// </summary>
    [HttpGet("{year}/{month}")]
    public async Task<ActionResult<ApiResponse<BudgetDto>>> GetBudgetByMonth(int year, int month)
    {
        var budget = await _budgetService.GetByMonthAsync(UserId, month, year);

        return Ok(new ApiResponse<BudgetDto>
        {
            Success = true,
            Message = budget != null ? "Budget retrieved successfully" : "No budget set for this month",
            Data = budget
        });
    }

    /// <summary>
    /// Get all budgets for the current user
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<BudgetDto>>>> GetAllBudgets()
    {
        var budgets = await _budgetService.GetAllByUserAsync(UserId);

        return Ok(new ApiResponse<List<BudgetDto>>
        {
            Success = true,
            Message = "Budgets retrieved successfully",
            Data = budgets
        });
    }

    /// <summary>
    /// Create or update a budget
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<BudgetDto>>> CreateOrUpdateBudget([FromBody] CreateBudgetRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<BudgetDto>
            {
                Success = false,
                Message = "Validation failed",
                Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
            });
        }

        var budget = await _budgetService.CreateOrUpdateAsync(UserId, request);

        return Ok(new ApiResponse<BudgetDto>
        {
            Success = true,
            Message = "Budget saved successfully",
            Data = budget
        });
    }

    /// <summary>
    /// Delete a budget
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteBudget(string id)
    {
        var result = await _budgetService.DeleteAsync(id, UserId);
        
        if (!result)
        {
            return NotFound(new ApiResponse<bool>
            {
                Success = false,
                Message = "Budget not found"
            });
        }

        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Message = "Budget deleted successfully",
            Data = true
        });
    }
}
