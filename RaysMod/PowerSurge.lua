local player = game.Players.LocalPlayer
local character = player.Character or player.CharacterAdded:Wait()

local humanoidRootPart = character:FindFirstChild("HumanoidRootPart")
if not humanoidRootPart then
    return
end

local function setPlayerCollide()
    for _, part in pairs(character:GetDescendants()) do
        if part:IsA("BasePart") then
            part.CanCollide = false
        end
    end
end

local function teleportModelsToPlayer()
    for _, obj in pairs(workspace:GetChildren()) do
        if obj:IsA("Model") and obj ~= character then
            if obj.PrimaryPart then
                local newPosition = humanoidRootPart.Position + humanoidRootPart.CFrame.LookVector * 50
                obj:SetPrimaryPartCFrame(CFrame.new(newPosition))
                for _, part in pairs(obj:GetDescendants()) do
                    if part:IsA("BasePart") then
                        part.CanCollide = false
                    end
                end
            end
        end
    end
end

teleportModelsToPlayer()

workspace.ChildAdded:Connect(function(child)
    if child:IsA("Model") and child ~= character then
        if child.PrimaryPart then
            local newPosition = humanoidRootPart.Position + humanoidRootPart.CFrame.LookVector * 50
            child:SetPrimaryPartCFrame(CFrame.new(newPosition))
            for _, part in pairs(child:GetDescendants()) do
                if part:IsA("BasePart") then
                    part.CanCollide = false
                end
            end
        end
    end
end)

player.CharacterAdded:Connect(function(newCharacter)
    newCharacter:WaitForChild("Humanoid").Died:Wait()
end)

while wait(0.01) do
    if character and character:FindFirstChild("Humanoid") and character.Humanoid.Health > 0 then
        teleportModelsToPlayer()
        setPlayerCollide()
    else
        break
    end
end
