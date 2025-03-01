game:GetService("StarterGui"):SetCore("SendNotification", {
    Title = "workspace.boulder TP..",
    Text = "Wait a few seconds ",
    Duration = 20
})

local boulder = workspace:FindFirstChild("boulder")

if boulder then
    local player = game.Players.LocalPlayer
    local camera = workspace.CurrentCamera
    camera.CameraSubject = boulder

    wait(2)
    boulder.CFrame = CFrame.new(25.192028045654297, 22.830297470092773, -158.59278869628906) * CFrame.Angles(math.rad(1), math.rad(0), math.rad(0))
    
    wait(3)
    boulder.CFrame = CFrame.new(10, 2187.6875, -12158.5) * CFrame.Angles(math.rad(-1), math.rad(0), math.rad(0))

    wait(0.2)
    boulder.CFrame = CFrame.new(6.62107086, 2041.5, -12402.7031) * CFrame.Angles(math.rad(1), math.rad(0), math.rad(0))
end
