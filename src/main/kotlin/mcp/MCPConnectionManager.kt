package org.example.mcp

import kotlinx.coroutines.DelicateCoroutinesApi
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import org.example.mcp.model.Message

object MCPConnectionManager {
    private var mcpClient: MCPClient? = null
    private val lock = Mutex()
    // 使用Channel代替BlockingQueue（更适合协程）
    val messageChannel = Channel<Message>(Channel.UNLIMITED)

    suspend fun getClient(): MCPClient {
        lock.withLock {
            if (mcpClient == null) {
                mcpClient = MCPClient().apply {
                    runBlocking { connectToServer() }
                }
            }
            return mcpClient!!
        }
    }

    fun close() {
        mcpClient?.close()
        mcpClient = null
    }

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun send(message: Message) {
        if (!messageChannel.isClosedForSend) {
            messageChannel.send(message)
        }
    }
}