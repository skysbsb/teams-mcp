export function registerAuthTools(server, graphService, _readOnly) {
    // Authentication status tool
    server.registerTool("auth_status", {
        title: "Auth Status",
        description: "Check the authentication status of the Microsoft Graph connection. Returns whether the user is authenticated and shows their basic profile information.",
        inputSchema: {},
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        },
    }, async () => {
        const status = await graphService.getAuthStatus();
        return {
            content: [
                {
                    type: "text",
                    text: status.isAuthenticated
                        ? `✅ Authenticated as ${status.displayName || "Unknown User"} (${status.userPrincipalName || "No email available"})`
                        : "❌ Not authenticated. Please run: npx @floriscornel/teams-mcp@latest authenticate",
                },
            ],
        };
    });
}
//# sourceMappingURL=auth.js.map