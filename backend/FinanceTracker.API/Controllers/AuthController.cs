using System.Security.Claims;
using FinanceTracker.API.DTOs;
using FinanceTracker.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Login with username and password
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);
        
        if (result == null)
        {
            return Unauthorized(new ApiResponse<LoginResponse>
            {
                Success = false,
                Message = "Invalid username or password, or account is disabled"
            });
        }

        return Ok(new ApiResponse<LoginResponse>
        {
            Success = true,
            Message = "Login successful",
            Data = result
        });
    }

    /// <summary>
    /// Get current user profile
    /// </summary>
    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetCurrentUser([FromServices] IUserService userService)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
        {
            return Unauthorized(new ApiResponse<UserDto>
            {
                Success = false,
                Message = "User not found"
            });
        }

        var user = await userService.GetByIdAsync(userId);
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
    /// Change current user's password
    /// </summary>
    [Authorize]
    [HttpPost("change-password")]
    public async Task<ActionResult<ApiResponse<bool>>> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
        {
            return Unauthorized(new ApiResponse<bool>
            {
                Success = false,
                Message = "User not authenticated"
            });
        }

        var result = await _authService.ChangePasswordAsync(userId, request);
        
        if (!result)
        {
            return BadRequest(new ApiResponse<bool>
            {
                Success = false,
                Message = "Current password is incorrect"
            });
        }

        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Message = "Password changed successfully",
            Data = true
        });
    }
}
