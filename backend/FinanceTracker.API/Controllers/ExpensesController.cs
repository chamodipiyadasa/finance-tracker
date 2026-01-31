using System.Security.Claims;
using FinanceTracker.API.DTOs;
using FinanceTracker.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExpensesController : ControllerBase
{
    private readonly IExpenseService _expenseService;

    public ExpensesController(IExpenseService expenseService)
    {
        _expenseService = expenseService;
    }

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    /// <summary>
    /// Get all expenses for the current user with optional filters
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<PaginatedResponse<ExpenseDto>>>> GetExpenses(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] string? categoryId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var filter = new ExpenseFilterRequest
        {
            StartDate = startDate,
            EndDate = endDate,
            CategoryId = categoryId,
            Page = page,
            PageSize = pageSize
        };

        var result = await _expenseService.GetByUserIdAsync(UserId, filter);

        return Ok(new ApiResponse<PaginatedResponse<ExpenseDto>>
        {
            Success = true,
            Message = "Expenses retrieved successfully",
            Data = result
        });
    }

    /// <summary>
    /// Get a specific expense by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<ExpenseDto>>> GetExpense(string id)
    {
        var expense = await _expenseService.GetByIdAsync(id, UserId);
        
        if (expense == null)
        {
            return NotFound(new ApiResponse<ExpenseDto>
            {
                Success = false,
                Message = "Expense not found"
            });
        }

        return Ok(new ApiResponse<ExpenseDto>
        {
            Success = true,
            Message = "Expense retrieved successfully",
            Data = expense
        });
    }

    /// <summary>
    /// Create a new expense
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<ExpenseDto>>> CreateExpense([FromBody] CreateExpenseRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<ExpenseDto>
            {
                Success = false,
                Message = "Validation failed",
                Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
            });
        }

        var expense = await _expenseService.CreateAsync(UserId, request);

        return CreatedAtAction(nameof(GetExpense), new { id = expense.Id }, new ApiResponse<ExpenseDto>
        {
            Success = true,
            Message = "Expense created successfully",
            Data = expense
        });
    }

    /// <summary>
    /// Update an existing expense
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<ExpenseDto>>> UpdateExpense(string id, [FromBody] UpdateExpenseRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<ExpenseDto>
            {
                Success = false,
                Message = "Validation failed",
                Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
            });
        }

        var expense = await _expenseService.UpdateAsync(id, UserId, request);
        
        if (expense == null)
        {
            return NotFound(new ApiResponse<ExpenseDto>
            {
                Success = false,
                Message = "Expense not found"
            });
        }

        return Ok(new ApiResponse<ExpenseDto>
        {
            Success = true,
            Message = "Expense updated successfully",
            Data = expense
        });
    }

    /// <summary>
    /// Delete an expense
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteExpense(string id)
    {
        var result = await _expenseService.DeleteAsync(id, UserId);
        
        if (!result)
        {
            return NotFound(new ApiResponse<bool>
            {
                Success = false,
                Message = "Expense not found"
            });
        }

        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Message = "Expense deleted successfully",
            Data = true
        });
    }

    /// <summary>
    /// Get monthly total for the current user
    /// </summary>
    [HttpGet("monthly-total")]
    public async Task<ActionResult<ApiResponse<decimal>>> GetMonthlyTotal(
        [FromQuery] int? month,
        [FromQuery] int? year)
    {
        var targetMonth = month ?? DateTime.UtcNow.Month;
        var targetYear = year ?? DateTime.UtcNow.Year;

        var total = await _expenseService.GetTotalForMonthAsync(UserId, targetMonth, targetYear);

        return Ok(new ApiResponse<decimal>
        {
            Success = true,
            Message = "Monthly total retrieved successfully",
            Data = total
        });
    }
}
