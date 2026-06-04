import { z } from "zod";
export function registerUsersTools(server, graphService, _readOnly) {
    // Get current user
    server.registerTool("get_current_user", {
        title: "Get Current User",
        description: "Get the current authenticated user's profile information including display name, email, job title, and department.",
        inputSchema: {},
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        },
    }, async () => {
        try {
            const client = await graphService.getClient();
            const user = (await client.api("/me").get());
            const userSummary = {
                displayName: user.displayName,
                userPrincipalName: user.userPrincipalName,
                mail: user.mail,
                id: user.id,
                jobTitle: user.jobTitle,
                department: user.department,
            };
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(userSummary, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ Error: ${errorMessage}`,
                    },
                ],
            };
        }
    });
    // Search users
    server.registerTool("search_users", {
        title: "Search Users",
        description: "Search for users in the organization by name or email address. Returns matching users with their basic profile information.",
        inputSchema: {
            query: z.string().describe("Search query (name or email)"),
        },
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true,
        },
    }, async ({ query }) => {
        try {
            const client = await graphService.getClient();
            const response = (await client
                .api("/users")
                .filter(`startswith(displayName,'${query}') or startswith(mail,'${query}') or startswith(userPrincipalName,'${query}')`)
                .get());
            if (!response?.value?.length) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "No users found matching your search.",
                        },
                    ],
                };
            }
            const userList = response.value.map((user) => ({
                displayName: user.displayName,
                userPrincipalName: user.userPrincipalName,
                mail: user.mail,
                id: user.id,
            }));
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(userList, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ Error: ${errorMessage}`,
                    },
                ],
            };
        }
    });
    // Get specific user
    server.registerTool("get_user", {
        title: "Get User",
        description: "Get detailed information about a specific user by their ID or email address. Returns profile information including name, email, job title, and department.",
        inputSchema: {
            userId: z.string().describe("User ID or email address"),
        },
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        },
    }, async ({ userId }) => {
        try {
            const client = await graphService.getClient();
            const user = (await client.api(`/users/${userId}`).get());
            const userSummary = {
                displayName: user.displayName,
                userPrincipalName: user.userPrincipalName,
                mail: user.mail,
                id: user.id,
                jobTitle: user.jobTitle,
                department: user.department,
                officeLocation: user.officeLocation,
            };
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(userSummary, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ Error: ${errorMessage}`,
                    },
                ],
            };
        }
    });
}
//# sourceMappingURL=users.js.map