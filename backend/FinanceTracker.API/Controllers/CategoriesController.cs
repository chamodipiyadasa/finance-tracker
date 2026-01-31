using FinanceTracker.API.DTOs;
using FinanceTracker.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    /// <summary>
    /// Get all categories
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<CategoryDto>>>> GetCategories([FromQuery] bool activeOnly = true)
    {
        var categories = activeOnly 
            ? await _categoryService.GetActiveAsync() 
            : await _categoryService.GetAllAsync();

        return Ok(new ApiResponse<List<CategoryDto>>
        {
            Success = true,
            Message = "Categories retrieved successfully",
            Data = categories
        });
    }

    /// <summary>
    /// Get a specific category by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> GetCategory(string id)
    {
        var category = await _categoryService.GetByIdAsync(id);
        
        if (category == null)
        {
            return NotFound(new ApiResponse<CategoryDto>
            {
                Success = false,
                Message = "Category not found"
            });
        }

        return Ok(new ApiResponse<CategoryDto>
        {
            Success = true,
            Message = "Category retrieved successfully",
            Data = category
        });
    }

    /// <summary>
    /// Create a new category (Admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> CreateCategory([FromBody] CreateCategoryRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<CategoryDto>
            {
                Success = false,
                Message = "Validation failed",
                Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
            });
        }

        var category = await _categoryService.CreateAsync(request);
        
        if (category == null)
        {
            return BadRequest(new ApiResponse<CategoryDto>
            {
                Success = false,
                Message = "Category with this name already exists"
            });
        }

        return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, new ApiResponse<CategoryDto>
        {
            Success = true,
            Message = "Category created successfully",
            Data = category
        });
    }

    /// <summary>
    /// Update an existing category (Admin only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> UpdateCategory(string id, [FromBody] UpdateCategoryRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<CategoryDto>
            {
                Success = false,
                Message = "Validation failed",
                Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
            });
        }

        var category = await _categoryService.UpdateAsync(id, request);
        
        if (category == null)
        {
            return NotFound(new ApiResponse<CategoryDto>
            {
                Success = false,
                Message = "Category not found or name already exists"
            });
        }

        return Ok(new ApiResponse<CategoryDto>
        {
            Success = true,
            Message = "Category updated successfully",
            Data = category
        });
    }

    /// <summary>
    /// Delete a category (Admin only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteCategory(string id)
    {
        var result = await _categoryService.DeleteAsync(id);
        
        if (!result)
        {
            return BadRequest(new ApiResponse<bool>
            {
                Success = false,
                Message = "Category not found or cannot delete default categories"
            });
        }

        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Message = "Category deleted successfully",
            Data = true
        });
    }
}
