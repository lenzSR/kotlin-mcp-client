package org.example.mcp

import io.ktor.client.*
import io.ktor.http.*
import io.modelcontextprotocol.kotlin.sdk.Implementation
import io.modelcontextprotocol.kotlin.sdk.TextContent
import io.modelcontextprotocol.kotlin.sdk.client.Client
import io.modelcontextprotocol.kotlin.sdk.client.SseClientTransport
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.example.mcp.model.*
import java.util.concurrent.TimeUnit

class MCPClient : AutoCloseable {
    private val sseConfig = HttpClient {
        install(io.ktor.client.plugins.sse.SSE) {
            // 可配置SSE插件
        }
    }

    private val transport = SseClientTransport(
        client = sseConfig,
        urlString = "YOUR_MCP_SERVER_URL",
        requestBuilder = {
            headers.apply {
                append(HttpHeaders.Accept, "text/event-stream")
                append(HttpHeaders.CacheControl, "no-cache")
                // 可添加认证头
            }
        }
    )

    // Initialize MCP client
    private val mcp: Client = Client(clientInfo = Implementation(name = "mcp-client-cli", version = "1.0.0"))

    // List of tools offered by the server
    private lateinit var tools: List<Tool>

    private val json = Json { ignoreUnknownKeys = true }

    override fun close() {
        runBlocking {
            mcp.close()
        }
    }

    // Connect to the server using the path to the server
    suspend fun connectToServer() {
        discoverTools()
//        executeConversation("412478720的信息")
    }

    suspend fun discoverTools() {
        // Connect the MCP client to the server using the transport
        mcp.connect(transport)

        // Request the list of available tools from the server
        tools = mcp.listTools()?.tools?.map { tool ->
            val toolParameters = ToolParameters(
                type = "object",
                properties = json.decodeFromString<Map<String, Property>>(tool.inputSchema.properties.toString()),
                required = tool.inputSchema.required ?: emptyList()
            )

            Tool("function", ToolFunction(tool.name, tool.description ?: "", toolParameters))
        } ?: emptyList()

    }

    /**
     * Executes a conversation with the server using the provided query.
     *
     * @param query The query to send to the server.
     */
    suspend fun executeConversation(query: String): Flow<String> = flow {
        val messages = mutableListOf(
            Message(role = "user", content = query)
        )

        while (true) {
            val response = sendMessages(messages, tools)

            val assistantMsg = response.choices.first().message
            emit(json.encodeToString(assistantMsg))
            messages.add(assistantMsg)

            assistantMsg.tool_calls?.forEach { call ->
                val result = mcp.callTool(call.function.name, call.function.arguments.jsonToMap())?.content
                    ?.joinToString("\n") { (it as? TextContent)?.text ?: "" }
                    ?: ""

                messages.add(Message(
                    role = "tool",
                    content = result,
                    tool_call_id = call.id
                ))
                emit(json.encodeToString(messages.last()))
            } ?: break
        }
    }

    /**
     * Sends messages to the server and returns the response.
     * use okhttp3
     *
     * @param messages The list of messages to send.
     * @param tools The list of tools to use.
     */
    private fun sendMessages(messages: List<Message>, tools: List<Tool>): ChatResponse {
        val client = OkHttpClient.Builder()
            .connectTimeout(1, TimeUnit.MINUTES)
            .readTimeout(1, TimeUnit.MINUTES)
            .writeTimeout(1, TimeUnit.MINUTES)
            .build()

        val requestBody = ChatRequest(
            model = "deepseek-chat",
            messages = messages,
            tools = tools
        ).let {
            val request = json.encodeToString(it)
            request
        }.toRequestBody("application/json".toMediaType())

        // 替换为有效的DeepSeek Api Key
        val request = Request.Builder()
            .url("https://api.deepseek.com/v1/chat/completions")
            .addHeader("Authorization", "Bearer DeepSeek_API_KEY")
            .post(requestBody)
            .build()

        val response = client.newCall(request).execute()
        val responseBody = response.body?.string() ?: error("Empty response")
        return json.decodeFromString<ChatResponse>(responseBody)
    }

    private fun String.jsonToMap(): Map<String, String> {
        return Json.parseToJsonElement(this).jsonObject
            .mapValues { element ->
                when (val value = element.value) {
                    is JsonPrimitive -> value.content
                    is JsonObject -> Json.encodeToString(value)
                    is JsonArray -> Json.encodeToString(value)
                    else -> value.toString()
                }
            }
    }

}