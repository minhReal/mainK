local player = game.Players.LocalPlayer
local toggleScreenGui = Instance.new("ScreenGui", player:WaitForChild("PlayerGui"))

local toggleFrameTeleport = Instance.new("Frame")
toggleFrameTeleport.Size = UDim2.new(0, 160, 0, 35)
toggleFrameTeleport.Position = UDim2.new(0.35, 0, -0.13, 0)
toggleFrameTeleport.BackgroundColor3 = Color3.fromRGB(100, 100, 100)
toggleFrameTeleport.Parent = toggleScreenGui

local toggleButtonTeleport = Instance.new("TextButton")
toggleButtonTeleport.Size = UDim2.new(1, 0, 1, 0)
toggleButtonTeleport.Text = "Teleport to Pages [ Use 1 time ]"
toggleButtonTeleport.Parent = toggleFrameTeleport

local function teleportToPages()
    local character = player.Character
    if character and character:FindFirstChild("HumanoidRootPart") then
        local positions = {
            CFrame.new(362, 24, -31), 
            CFrame.new(124, 24, -10), 
            CFrame.new(117, 24, 279), 
            CFrame.new(-161, 24, -272), 
            CFrame.new(82, 24, -443), 
            CFrame.new(273, 24, -375), 
            CFrame.new(-222, 24, 101), 
            CFrame.new(-113, 24, -606), 
        }        
        for _, position in ipairs(positions) do
            character.HumanoidRootPart.CFrame = position
            wait(0.5)
        end
    end
end

toggleButtonTeleport.MouseButton1Click:Connect(function()
    teleportToPages()
end)

game:GetService("StarterGui"):SetCore("SendNotification", {
    Title = "Notification",
    Text = "Script by Hydro_gen",
    Icon = "rbxassetid://11713336301",
    Duration = 10
})

local toggleFrameMove = Instance.new("Frame")
toggleFrameMove.Size = UDim2.new(0, 100, 0, 35)
toggleFrameMove.Position = UDim2.new(0.21, 0, -0.13, 0)
toggleFrameMove.BackgroundColor3 = Color3.fromRGB(100, 100, 100)
toggleFrameMove.Parent = toggleScreenGui

local isActive = false

local toggleButtonMove = Instance.new("TextButton")
toggleButtonMove.Size = UDim2.new(1, 0, 1, 0)
toggleButtonMove.Text = "Toggle Move"
toggleButtonMove.Parent = toggleFrameMove

local function moveToTargetPart()
    while isActive do
        wait(0.1)
        local character = player.Character or player.CharacterAdded:Wait()

        if character then
            local humanoid = character:WaitForChild("Humanoid")
            local targetPart = game:GetService("Workspace").map.Model["Redwoods Forest by lupalb4"].EasterEggs.Pages.Part

            if targetPart then
                humanoid:MoveTo(targetPart.Position)

                humanoid.MoveToFinished:Connect(function(reached)
                end)
            end
        end
    end
    
    game:GetService("StarterGui"):SetCore("SendNotification", {
        Title = "Notification", 
        Text = "The script has stopped, you can now run it", 
        Icon = "rbxassetid://17829955945", 
        Duration = 10
    })
end

toggleButtonMove.MouseButton1Click:Connect(function()
    isActive = not isActive
    if isActive then
        toggleButtonMove.Text = "Stop Moving"
        moveToTargetPart()
    else
        toggleButtonMove.Text = "Toggle Move"
    end
end)
