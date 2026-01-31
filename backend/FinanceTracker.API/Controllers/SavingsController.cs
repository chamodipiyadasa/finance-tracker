using System.Security.Claims;
using FinanceTracker.API.DTOs;
using FinanceTracker.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SavingsController : ControllerBase
{
    private readonly ISavingsService _savingsService;

    public SavingsController(ISavingsService savingsService)
    {
        _savingsService = savingsService;
    }

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    /// <summary>
    /// Get savings summary for the current user
    /// </summary>
    [HttpGet("summary")]
    public async Task<ActionResult<ApiResponse<SavingsSummaryDto>>> GetSummary()
    {
        var summary = await _savingsService.GetSummaryAsync(UserId);

        return Ok(new ApiResponse<SavingsSummaryDto>
        {
            Success = true,
            Message = "Summary retrieved successfully",
            Data = summary
        });
    }

    /// <summary>
    /// Get all savings goals for the current user
    /// </summary>
    [HttpGet("goals")]
    public async Task<ActionResult<ApiResponse<List<SavingsGoalDto>>>> GetGoals()
    {
        var goals = await _savingsService.GetGoalsByUserIdAsync(UserId);

        return Ok(new ApiResponse<List<SavingsGoalDto>>
        {
            Success = true,
            Message = "Goals retrieved successfully",
            Data = goals
        });
    }

    /// <summary>
    /// Get a specific savings goal
    /// </summary>
    [HttpGet("goals/{id}")]
    public async Task<ActionResult<ApiResponse<SavingsGoalDto>>> GetGoal(string id)
    {
        var goal = await _savingsService.GetGoalByIdAsync(id, UserId);

        if (goal == null)
        {
            return NotFound(new ApiResponse<SavingsGoalDto>
            {
                Success = false,
                Message = "Goal not found"
            });
        }

        return Ok(new ApiResponse<SavingsGoalDto>
        {
            Success = true,
            Message = "Goal retrieved successfully",
            Data = goal
        });
    }

    /// <summary>
    /// Create a new savings goal
    /// </summary>
    [HttpPost("goals")]
    public async Task<ActionResult<ApiResponse<SavingsGoalDto>>> CreateGoal([FromBody] CreateSavingsGoalRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<SavingsGoalDto>
            {
                Success = false,
                Message = "Validation failed",
                Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
            });
        }

        var goal = await _savingsService.CreateGoalAsync(UserId, request);

        return Ok(new ApiResponse<SavingsGoalDto>
        {
            Success = true,
            Message = "Goal created successfully",
            Data = goal
        });
    }

    /// <summary>
    /// Update a savings goal
    /// </summary>
    [HttpPut("goals/{id}")]
    public async Task<ActionResult<ApiResponse<SavingsGoalDto>>> UpdateGoal(string id, [FromBody] UpdateSavingsGoalRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<SavingsGoalDto>
            {
                Success = false,
                Message = "Validation failed",
                Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
            });
        }

        var goal = await _savingsService.UpdateGoalAsync(id, UserId, request);

        if (goal == null)
        {
            return NotFound(new ApiResponse<SavingsGoalDto>
            {
                Success = false,
                Message = "Goal not found"
            });
        }

        return Ok(new ApiResponse<SavingsGoalDto>
        {
            Success = true,
            Message = "Goal updated successfully",
            Data = goal
        });
    }

    /// <summary>
    /// Delete a savings goal
    /// </summary>
    [HttpDelete("goals/{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteGoal(string id)
    {
        var result = await _savingsService.DeleteGoalAsync(id, UserId);

        if (!result)
        {
            return NotFound(new ApiResponse<bool>
            {
                Success = false,
                Message = "Goal not found"
            });
        }

        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Message = "Goal deleted successfully",
            Data = true
        });
    }

    /// <summary>
    /// Add money (deposit) or withdraw from a savings goal
    /// </summary>
    [HttpPost("goals/{goalId}/transactions")]
    public async Task<ActionResult<ApiResponse<SavingsTransactionDto>>> AddTransaction(
        string goalId, 
        [FromBody] AddSavingsTransactionRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<SavingsTransactionDto>
            {
                Success = false,
                Message = "Validation failed",
                Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
            });
        }

        var transaction = await _savingsService.AddTransactionAsync(goalId, UserId, request);

        if (transaction == null)
        {
            return BadRequest(new ApiResponse<SavingsTransactionDto>
            {
                Success = false,
                Message = request.Type == "withdraw" 
                    ? "Insufficient balance or goal not found" 
                    : "Goal not found"
            });
        }

        return Ok(new ApiResponse<SavingsTransactionDto>
        {
            Success = true,
            Message = $"{(request.Type == "deposit" ? "Money added" : "Money withdrawn")} successfully",
            Data = transaction
        });
    }

    /// <summary>
    /// Get transactions for a specific goal
    /// </summary>
    [HttpGet("goals/{goalId}/transactions")]
    public async Task<ActionResult<ApiResponse<List<SavingsTransactionDto>>>> GetGoalTransactions(string goalId)
    {
        var transactions = await _savingsService.GetTransactionsByGoalIdAsync(goalId, UserId);

        return Ok(new ApiResponse<List<SavingsTransactionDto>>
        {
            Success = true,
            Message = "Transactions retrieved successfully",
            Data = transactions
        });
    }

    /// <summary>
    /// Get recent transactions across all goals
    /// </summary>
    [HttpGet("transactions/recent")]
    public async Task<ActionResult<ApiResponse<List<SavingsTransactionDto>>>> GetRecentTransactions([FromQuery] int limit = 20)
    {
        var transactions = await _savingsService.GetRecentTransactionsAsync(UserId, limit);

        return Ok(new ApiResponse<List<SavingsTransactionDto>>
        {
            Success = true,
            Message = "Recent transactions retrieved successfully",
            Data = transactions
        });
    }
}
