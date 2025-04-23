package org.example.mcp.model

import kotlinx.serialization.Serializable

// 定义数据模型（使用 kotlinx.serialization）
@Serializable
data class Message(
    val role: String,
    val content: String,
    val tool_calls: List<ToolCall>? = null,
    val tool_call_id: String? = null
)

@Serializable
data class ToolCall(
    val id: String,
    val function: FunctionCall,
    val index: Int,
    val type: String
)

@Serializable
data class FunctionCall(
    val name: String,
    val arguments: String
)

@Serializable
data class ChatRequest(
    val model: String,
    val messages: List<Message>,
    val tools: List<Tool>
)

@Serializable
data class Tool(
    val type: String,
    val function: ToolFunction
)

@Serializable
data class ToolFunction(
    val name: String,
    val description: String,
    val parameters: ToolParameters
)

@Serializable
data class ToolParameters(
    val type: String,
    val properties: Map<String, Property>,
    val required: List<String>
)

@Serializable
data class Property(
    val type: String,
    val description: String
)

@Serializable
data class ChatResponse(
    val choices: List<Choice>
)

@Serializable
data class Choice(
    val message: Message
)

