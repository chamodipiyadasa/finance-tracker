using FinanceTracker.API.DTOs;
using FinanceTracker.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    /// <summary>
    /// Get all users (Admin only)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<UserDto>>>> GetUsers()
    {
        var users = await _userService.GetAllAsync();

        return Ok(new ApiResponse<List<UserDto>>
        {
            Success = true,
            Message = "Users retrieved successfully",
            Data = users
        });
    }

    /// <summary>
    /// Get user summaries with expense data (Admin only)
    /// </summary>
    [HttpGet("summaries")]
    public async Task<ActionResult<ApiResponse<List<UserSummaryDto>>>> GetUserSummaries()
    {
        var summaries = await _userService.GetUserSummariesAsync();

        return Ok(new ApiResponse<List<UserSummaryDto>>
        {
            Success = true,
            Message = "User summaries retrieved successfully",
            Data = summaries
        });
    }

    /// <summary>
    /// Get a specific user by ID (Admin only)
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetUser(string id)
    {
        var user = await _userService.GetByIdAsync(id);
        
        if (user == null)
        {
            return NotFound(new ApiResponse<UserDto>
            {
                Success = false,
                Message = "User not found"
            });
        }

        return Ok(new ApiResponse<UserDto>
        {
            Success = true,
            Message = "User retrieved successfully",
            Data = user
        });
    }

    /// <summary>
    /// Create a new user (Admin only)
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<UserDto>>> CreateUser([FromBody] CreateUserRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<UserDto>
            {
                Success = false,
                Message = "Validation failed",
                Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
            });
        }

        var user = await _userService.CreateAsync(request);
        
        if (user == null)
        {
            return BadRequest(new ApiResponse<UserDto>
            {
                Success = false,
                Message = "Username or email already exists"
            });
        }

        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, new ApiResponse<UserDto>
        {
            Success = true,
            Message = "User created successfully",
            Data = user
        });
    }

    /// <summary>
    /// Update a user (Admin only)
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<UserDto>>> UpdateUser(string id, [FromBody] UpdateUserRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<UserDto>
            {
                Success = false,
                Message = "Validation failed",
                Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
            });
        }

        var user = await _userService.UpdateAsync(id, request);
        
        if (user == null)
        {
            return NotFound(new ApiResponse<UserDto>
            {
                Success = false,
                Message = "User not found or email already exists"
            });
        }

        return Ok(new ApiResponse<UserDto>
        {
            Success = true,
            Message = "User updated successfully",
            Data = user
        });
    }

    /// <summary>
    /// Toggle user active status (Admin only)
    /// </summary>
    [HttpPatch("{id}/toggle-status")]
    public async Task<ActionResult<ApiResponse<bool>>> ToggleUserStatus(string id)
    {
        var result = await _userService.ToggleActiveStatusAsync(id);
        
        if (!result)
        {
            return NotFound(new ApiResponse<bool>
            {
                Success = false,
                Message = "User not found"
            });
        }

        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Message = "User status toggled successfully",
            Data = true
        });
    }

    /// <summary>
    /// Delete a user (Admin only)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteUser(string id)
    {
        var result = await _userService.DeleteAsync(id);
        
        if (!result)
        {
            return NotFound(new ApiResponse<bool>
            {
                Success = false,
                Message = "User not found"
            });
        }

        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Message = "User deleted successfully",
            Data = true
        });
    }
}
