#!/usr/bin/env python3
"""
HR API MCP Server - Provides access to HR Enterprise API through MCP tools.
"""

import asyncio
import json
import logging
import os
from typing import Any, Sequence
import aiohttp

from mcp.server import Server, NotificationOptions
from mcp.server.models import InitializationOptions
import mcp.server.stdio
import mcp.types as types

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("hr-api-mcp-server")

# Create the server instance
server = Server("hr-api-mcp-server")

# HR API configuration
HR_API_BASE_URL = os.getenv("HR_API_BASE_URL", "http://hr-enterprise-api:80")
HR_API_KEY = os.getenv("HR_API_KEY", "hr-api-default-key-change-in-production")

async def make_hr_api_request(method: str, endpoint: str, data: dict = None) -> dict:
    """Make a request to the HR API."""
    url = f"{HR_API_BASE_URL}/api/v1{endpoint}"
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": HR_API_KEY
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            if method.upper() == "GET":
                async with session.get(url, headers=headers) as response:
                    return await response.json()
            elif method.upper() == "POST":
                async with session.post(url, headers=headers, json=data) as response:
                    return await response.json()
            elif method.upper() == "PUT":
                async with session.put(url, headers=headers, json=data) as response:
                    return await response.json()
            elif method.upper() == "DELETE":
                async with session.delete(url, headers=headers) as response:
                    if response.status == 204:
                        return {"message": "Successfully deleted"}
                    return await response.json()
    except Exception as e:
        logger.error(f"HR API request failed: {e}")
        raise ValueError(f"HR API request failed: {str(e)}")

@server.list_tools()
async def handle_list_tools() -> list[types.Tool]:
    """List available HR tools."""
    return [
        types.Tool(
            name="get_employees",
            description="Get list of employees with optional filtering by department, status, or location",
            inputSchema={
                "type": "object",
                "properties": {
                    "department": {
                        "type": "string",
                        "description": "Filter by department (optional)"
                    },
                    "status": {
                        "type": "string",
                        "enum": ["active", "inactive", "terminated"],
                        "description": "Filter by employment status (optional)"
                    },
                    "location": {
                        "type": "string",
                        "description": "Filter by work location (optional)"
                    }
                }
            }
        ),
        types.Tool(
            name="get_employee",
            description="Get detailed information about a specific employee by ID",
            inputSchema={
                "type": "object",
                "properties": {
                    "employee_id": {
                        "type": "integer",
                        "description": "Employee ID to retrieve"
                    }
                },
                "required": ["employee_id"]
            }
        ),
        types.Tool(
            name="get_vacation_requests",
            description="Get vacation requests with optional filtering by employee or status",
            inputSchema={
                "type": "object",
                "properties": {
                    "employee_id": {
                        "type": "string",
                        "description": "Filter by employee ID (optional)"
                    },
                    "status": {
                        "type": "string",
                        "enum": ["pending", "approved", "rejected", "cancelled"],
                        "description": "Filter by request status (optional)"
                    }
                }
            }
        ),
        types.Tool(
            name="get_vacation_balance",
            description="Get vacation balance for a specific employee",
            inputSchema={
                "type": "object",
                "properties": {
                    "employee_id": {
                        "type": "string",
                        "description": "Employee ID to get vacation balance for"
                    }
                },
                "required": ["employee_id"]
            }
        ),
        types.Tool(
            name="submit_vacation_request",
            description="Submit a new vacation request for an employee",
            inputSchema={
                "type": "object",
                "properties": {
                    "employee_id": {
                        "type": "string",
                        "description": "Employee ID submitting the request"
                    },
                    "type": {
                        "type": "string",
                        "enum": ["annual", "sick", "personal", "maternity", "paternity"],
                        "description": "Type of vacation"
                    },
                    "start_date": {
                        "type": "string",
                        "format": "date",
                        "description": "Start date (YYYY-MM-DD)"
                    },
                    "end_date": {
                        "type": "string",
                        "format": "date", 
                        "description": "End date (YYYY-MM-DD)"
                    },
                    "days": {
                        "type": "integer",
                        "description": "Number of vacation days"
                    },
                    "reason": {
                        "type": "string",
                        "description": "Reason for vacation (optional)"
                    }
                },
                "required": ["employee_id", "type", "start_date", "end_date", "days"]
            }
        ),
        types.Tool(
            name="get_job_postings",
            description="Get list of job postings with optional filtering",
            inputSchema={
                "type": "object",
                "properties": {
                    "department": {
                        "type": "string",
                        "description": "Filter by department (optional)"
                    },
                    "location": {
                        "type": "string",
                        "description": "Filter by location (optional)"
                    },
                    "status": {
                        "type": "string",
                        "enum": ["open", "closed", "on_hold"],
                        "description": "Filter by job status (optional)"
                    },
                    "level": {
                        "type": "string",
                        "enum": ["entry", "junior", "mid", "senior", "executive"],
                        "description": "Filter by job level (optional)"
                    }
                }
            }
        ),
        types.Tool(
            name="get_job_details",
            description="Get detailed information about a specific job posting",
            inputSchema={
                "type": "object",
                "properties": {
                    "job_id": {
                        "type": "integer",
                        "description": "Job ID to retrieve"
                    }
                },
                "required": ["job_id"]
            }
        ),
        types.Tool(
            name="get_performance_reviews",
            description="Get performance reviews with optional filtering",
            inputSchema={
                "type": "object",
                "properties": {
                    "employee_id": {
                        "type": "string",
                        "description": "Filter by employee ID (optional)"
                    },
                    "review_period": {
                        "type": "string",
                        "description": "Filter by review period (optional)"
                    },
                    "status": {
                        "type": "string",
                        "enum": ["draft", "in-progress", "completed", "approved"],
                        "description": "Filter by review status (optional)"
                    }
                }
            }
        ),
        types.Tool(
            name="get_performance_analytics",
            description="Get performance analytics and metrics",
            inputSchema={
                "type": "object",
                "properties": {
                    "department": {
                        "type": "string",
                        "description": "Filter analytics by department (optional)"
                    },
                    "period": {
                        "type": "string",
                        "description": "Analysis period (optional)"
                    }
                }
            }
        )
    ]

@server.call_tool()
async def handle_call_tool(
    name: str, arguments: dict[str, Any] | None
) -> list[types.TextContent | types.ImageContent | types.EmbeddedResource]:
    """Handle HR tool calls."""
    
    try:
        if name == "get_employees":
            params = {}
            if arguments:
                if "department" in arguments:
                    params["department"] = arguments["department"]
                if "status" in arguments:
                    params["status"] = arguments["status"]
                if "location" in arguments:
                    params["location"] = arguments["location"]
            
            query_string = "&".join([f"{k}={v}" for k, v in params.items()])
            endpoint = f"/employees?{query_string}" if query_string else "/employees"
            result = await make_hr_api_request("GET", endpoint)
            
            employees = result.get("employees", [])
            summary = f"Found {len(employees)} employees"
            if params:
                filters = ", ".join([f"{k}: {v}" for k, v in params.items()])
                summary += f" (filtered by {filters})"
            
            employee_list = "\n".join([
                f"• {emp['firstName']} {emp['lastName']} ({emp['employeeId']}) - {emp['position']} in {emp['department']}"
                for emp in employees[:10]  # Limit to first 10 for readability
            ])
            
            if len(employees) > 10:
                employee_list += f"\n... and {len(employees) - 10} more employees"
            
            return [
                types.TextContent(
                    type="text",
                    text=f"{summary}\n\n{employee_list}"
                )
            ]
        
        elif name == "get_employee":
            if not arguments or "employee_id" not in arguments:
                raise ValueError("Employee ID is required")
            
            employee_id = arguments["employee_id"]
            result = await make_hr_api_request("GET", f"/employees/{employee_id}")
            
            emp = result
            details = f"""Employee Details:
• Name: {emp['firstName']} {emp['lastName']}
• Employee ID: {emp['employeeId']}
• Email: {emp['email']}
• Department: {emp['department']}
• Position: {emp['position']}
• Manager: {emp.get('manager', 'N/A')}
• Hire Date: {emp['hireDate']}
• Location: {emp['location']}
• Status: {emp['status']}
• Salary: ${emp['salary']:,}"""
            
            return [
                types.TextContent(
                    type="text",
                    text=details
                )
            ]
        
        elif name == "get_vacation_requests":
            params = {}
            if arguments:
                if "employee_id" in arguments:
                    params["employeeId"] = arguments["employee_id"]
                if "status" in arguments:
                    params["status"] = arguments["status"]
            
            query_string = "&".join([f"{k}={v}" for k, v in params.items()])
            endpoint = f"/vacations?{query_string}" if query_string else "/vacations"
            result = await make_hr_api_request("GET", endpoint)
            
            vacations = result.get("vacations", [])
            summary = f"Found {len(vacations)} vacation requests"
            
            vacation_list = "\n".join([
                f"• {vac['employeeId']}: {vac['type']} leave from {vac['startDate']} to {vac['endDate']} ({vac['days']} days) - Status: {vac['status']}"
                for vac in vacations[:10]
            ])
            
            if len(vacations) > 10:
                vacation_list += f"\n... and {len(vacations) - 10} more requests"
            
            return [
                types.TextContent(
                    type="text",
                    text=f"{summary}\n\n{vacation_list}"
                )
            ]
        
        elif name == "get_vacation_balance":
            if not arguments or "employee_id" not in arguments:
                raise ValueError("Employee ID is required")
            
            employee_id = arguments["employee_id"]
            result = await make_hr_api_request("GET", f"/vacations/balance/{employee_id}")
            
            balance = f"""Vacation Balance for {employee_id}:
• Annual Leave: {result['remainingAnnual']}/{result['annualDays']} days remaining
• Sick Leave: {result['remainingSick']}/{result['sickDays']} days remaining  
• Personal Leave: {result['remainingPersonal']}/{result['personalDays']} days remaining

Used This Year:
• Annual: {result['usedAnnual']} days
• Sick: {result['usedSick']} days
• Personal: {result['usedPersonal']} days"""
            
            return [
                types.TextContent(
                    type="text",
                    text=balance
                )
            ]
        
        elif name == "submit_vacation_request":
            if not arguments:
                raise ValueError("Vacation request details are required")
            
            required_fields = ["employee_id", "type", "start_date", "end_date", "days"]
            for field in required_fields:
                if field not in arguments:
                    raise ValueError(f"{field} is required")
            
            # Map field names to API format
            request_data = {
                "employeeId": arguments["employee_id"],
                "type": arguments["type"],
                "startDate": arguments["start_date"],
                "endDate": arguments["end_date"],
                "days": arguments["days"]
            }
            
            if "reason" in arguments:
                request_data["reason"] = arguments["reason"]
            
            result = await make_hr_api_request("POST", "/vacations", request_data)
            
            return [
                types.TextContent(
                    type="text",
                    text=f"Vacation request submitted successfully! Request ID: {result['id']}\nStatus: {result['status']}\nType: {result['type']}\nDates: {result['startDate']} to {result['endDate']} ({result['days']} days)"
                )
            ]
        
        elif name == "get_job_postings":
            params = {}
            if arguments:
                for key in ["department", "location", "status", "level"]:
                    if key in arguments:
                        params[key] = arguments[key]
            
            query_string = "&".join([f"{k}={v}" for k, v in params.items()])
            endpoint = f"/jobs?{query_string}" if query_string else "/jobs"
            result = await make_hr_api_request("GET", endpoint)
            
            jobs = result.get("jobs", [])
            summary = f"Found {len(jobs)} job postings"
            
            job_list = "\n".join([
                f"• {job['title']} (ID: {job['id']}) - {job['department']} in {job['location']}\n  Level: {job['level']}, Type: {job['type']}, Status: {job['status']}\n  Salary: ${job['salary']['min']:,} - ${job['salary']['max']:,}\n  Applicants: {job['applicantCount']}"
                for job in jobs[:5]  # Limit to first 5 for readability
            ])
            
            if len(jobs) > 5:
                job_list += f"\n... and {len(jobs) - 5} more job postings"
            
            return [
                types.TextContent(
                    type="text",
                    text=f"{summary}\n\n{job_list}"
                )
            ]
        
        elif name == "get_job_details":
            if not arguments or "job_id" not in arguments:
                raise ValueError("Job ID is required")
            
            job_id = arguments["job_id"]
            result = await make_hr_api_request("GET", f"/jobs/{job_id}")
            
            job = result
            details = f"""Job Details - {job['title']}:
• Job ID: {job['id']}
• Department: {job['department']}
• Location: {job['location']}
• Employment Type: {job['type']}
• Level: {job['level']}
• Salary Range: ${job['salary']['min']:,} - ${job['salary']['max']:,} {job['salary']['currency']}
• Hiring Manager: {job['hiringManager']}
• Posted Date: {job['postedDate']}
• Closing Date: {job['closingDate']}
• Status: {job['status']}
• Applications: {job['applicantCount']}

Description:
{job['description']}

Requirements:
{chr(10).join(['• ' + req for req in job['requirements']])}

Benefits:
{chr(10).join(['• ' + benefit for benefit in job['benefits']])}"""
            
            return [
                types.TextContent(
                    type="text",
                    text=details
                )
            ]
        
        elif name == "get_performance_reviews":
            params = {}
            if arguments:
                if "employee_id" in arguments:
                    params["employeeId"] = arguments["employee_id"]
                if "review_period" in arguments:
                    params["reviewPeriod"] = arguments["review_period"]
                if "status" in arguments:
                    params["status"] = arguments["status"]
            
            query_string = "&".join([f"{k}={v}" for k, v in params.items()])
            endpoint = f"/performance/reviews?{query_string}" if query_string else "/performance/reviews"
            result = await make_hr_api_request("GET", endpoint)
            
            reviews = result.get("reviews", [])
            summary = f"Found {len(reviews)} performance reviews"
            
            review_list = "\n".join([
                f"• {review['employeeId']} - {review['reviewPeriod']} ({review['reviewType']})\n  Overall Rating: {review['overallRating']}/5.0, Status: {review['status']}\n  Reviewer: {review['reviewer']}, Date: {review['reviewDate']}"
                for review in reviews[:5]
            ])
            
            if len(reviews) > 5:
                review_list += f"\n... and {len(reviews) - 5} more reviews"
            
            return [
                types.TextContent(
                    type="text",
                    text=f"{summary}\n\n{review_list}"
                )
            ]
        
        elif name == "get_performance_analytics":
            params = {}
            if arguments:
                if "department" in arguments:
                    params["department"] = arguments["department"]
                if "period" in arguments:
                    params["period"] = arguments["period"]
            
            query_string = "&".join([f"{k}={v}" for k, v in params.items()])
            endpoint = f"/performance/analytics?{query_string}" if query_string else "/performance/analytics"
            result = await make_hr_api_request("GET", endpoint)
            
            analytics = f"""Performance Analytics:
• Period: {result['period']}
• Total Reviews: {result['totalReviews']}
• Average Rating: {result['averageRating']}/5.0
• Goal Achievement Rate: {result['goalAchievementRate']}%

Rating Distribution:
{chr(10).join([f'• {rating} stars: {count} reviews' for rating, count in result['ratingDistribution'].items()])}

Top Performers:
{chr(10).join([f'• {perf["employeeId"]}: {perf["rating"]}/5.0' for perf in result['topPerformers']])}"""
            
            return [
                types.TextContent(
                    type="text",
                    text=analytics
                )
            ]
        
        else:
            raise ValueError(f"Unknown tool: {name}")
    
    except Exception as e:
        logger.error(f"Tool execution failed: {e}")
        return [
            types.TextContent(
                type="text",
                text=f"Error: {str(e)}"
            )
        ]

async def main():
    # Run the server using stdio
    async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="custom-mcp-server",
                server_version="1.0.0",
                capabilities=server.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={},
                ),
            ),
        )

if __name__ == "__main__":
    asyncio.run(main())