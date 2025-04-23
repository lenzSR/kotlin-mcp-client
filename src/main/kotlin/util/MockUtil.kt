package org.example.util

import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.serialization.encodeToString
import java.util.*
import kotlin.uuid.ExperimentalUuidApi

object MockUtil {
    private var toolCallIds = List(3) { UUID.randomUUID() }

    private val str: String
        get() = """
            {
              "role": "assistant",
              "content": "",
              "tool_calls": [
                {
                  "id": "${toolCallIds[0]}",
                  "function": {
                    "name": "listAllApis",
                    "arguments": "{}"
                  },
                  "index": 0,
                  "type": "function"
                }
              ]
            }#####
            {
              "role": "tool",
              "content": "可用API列表(apiId-Name-Description):\n\n这是一段模拟数据，如需要进行完整的对话，请准备自己的SSE MCP服务器和DeepSeek API KEY。",
              "tool_call_id": "${toolCallIds[0]}"
            }#####
            {
              "role": "assistant",
              "content": "",
              "tool_calls": [
                {
                  "id": "${toolCallIds[1]}",
                  "function": {
                    "name": "functionName",
                    "arguments": "{\"apiId\":\"functionName\"}"
                  },
                  "index": 0,
                  "type": "function"
                }
              ]
            }#####
            {
              "role": "tool",
              "content": "API详细信息:\n这是一段模拟数据，如需要进行完整的对话，请准备自己的SSE MCP服务器和DeepSeek API KEY。",
              "tool_call_id": "${toolCallIds[1]}"
            }#####
            {
              "role": "assistant",
              "content": "",
              "tool_calls": [
                {
                  "id": "${toolCallIds[2]}",
                  "function": {
                    "name": "executeApi",
                    "arguments": "{\"apiId\":\"functionName\",\"params\":{\"param1\":\"value1\"}}"
                  },
                  "index": 0,
                  "type": "function"
                }
              ]
            }#####
            {
              "role": "tool",
              "content": "这是一段模拟数据，如需要进行完整的对话，请准备自己的SSE MCP服务器和DeepSeek API KEY。",
              "tool_call_id": "${toolCallIds[2]}"
            }#####
            {
              "role": "assistant",
              "content": "这是一段模拟数据，如需要进行完整的对话，请准备：\n\n- **MCP服务器**: 使用SSE方式传输\n- **APi KEY**: DeepSeek API KEY\n"
            }
    """.trimIndent()

    suspend fun send(): Flow<String> = flow {
        toolCallIds = List(3) { UUID.randomUUID() }
        str.split("#####").forEach { value ->
            emit(value.trimIndent().replace("\n", ""))
            delay(1000)
        }
    }
}