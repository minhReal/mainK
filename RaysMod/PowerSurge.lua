local player = game.Players.LocalPlayer
local character = player.Character or player.CharacterAdded:Wait()

-- Kiểm tra xem HumanoidRootPart có tồn tại không
local humanoidRootPart = character:FindFirstChild("HumanoidRootPart")
if not humanoidRootPart then
    return warn("HumanoidRootPart not found!")
end

local function setPlayerCollide()
    -- Đặt CanCollide của nhân vật thành false liên tục
    for _, part in pairs(character:GetDescendants()) do
        if part:IsA("BasePart") then
            part.CanCollide = false
        end
    end
end

local function teleportModelsToPlayer()
    for _, obj in pairs(workspace:GetChildren()) do
        if obj:IsA("Model") and obj ~= character then -- Kiểm tra nếu obj là model và không phải là model của người chơi
            if obj.PrimaryPart then
                local newPosition = humanoidRootPart.Position + humanoidRootPart.CFrame.LookVector * 50 -- Đặt vị trí cách người chơi 50 studs
                obj:SetPrimaryPartCFrame(CFrame.new(newPosition)) -- Dịch chuyển model đến vị trí mới
                -- Đặt CanCollide của tất cả các phần của model thành false
                for _, part in pairs(obj:GetDescendants()) do
                    if part:IsA("BasePart") then
                        part.CanCollide = false
                    end
                end
            end
        end
    end
end

-- Kiểm tra ban đầu trong workspace
teleportModelsToPlayer()

-- Kết nối sự kiện để kiểm tra mỗi khi có đối tượng mới được thêm vào workspace
workspace.ChildAdded:Connect(function(child)
    if child:IsA("Model") and child ~= character then -- Kiểm tra nếu child là model và không phải là model của người chơi
        if child.PrimaryPart then
            local newPosition = humanoidRootPart.Position + humanoidRootPart.CFrame.LookVector * 50 -- Đặt vị trí cách người chơi 50 studs
            child:SetPrimaryPartCFrame(CFrame.new(newPosition)) -- Dịch chuyển model đến vị trí mới
            
            -- Đặt CanCollide của tất cả các phần của model thành false
            for _, part in pairs(child:GetDescendants()) do
                if part:IsA("BasePart") then
                    part.CanCollide = false
                end
            end
        end
    end
end)

-- Kết nối sự kiện để kiểm tra khi người chơi chết
player.CharacterAdded:Connect(function(newCharacter)
    newCharacter:WaitForChild("Humanoid").Died:Wait() -- Chờ cho đến khi Humanoid chết
end)

-- Vòng lặp kiểm tra liên tục (nên sử dụng cẩn thận)
while wait(0.01) do
    if character and character:FindFirstChild("Humanoid") and character.Humanoid.Health > 0 then
        teleportModelsToPlayer()
        setPlayerCollide() -- Đặt CanCollide của nhân vật thành false liên tục
    else
        break -- Dừng vòng lặp nếu người chơi chết
    end
end
