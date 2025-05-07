
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Send, PlusCircle } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const NutritionPage = () => {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Hi there! I'm your nutrition assistant. Ask me anything about nutrition, meal planning, diet tips, or recipe ideas!",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Function to generate a unique ID for messages
  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Mock AI response function - in a real implementation, this would call the AI endpoint
  const getAIResponse = async (userPrompt: string): Promise<string> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // List of predefined responses based on common nutrition queries
    const responses = [
      `Based on your question about "${userPrompt.slice(0, 20)}...", I'd recommend focusing on whole foods like lean proteins, fruits, vegetables, and whole grains. These provide essential nutrients while supporting your fitness goals.`,
      `Great question! For optimal nutrition when working out, aim to consume a balance of carbohydrates and protein within 45 minutes after exercise to support muscle recovery.`,
      `I'd suggest a meal plan that includes breakfast with oats and protein, lunch with lean protein and vegetables, and dinner with a balanced mix of protein, complex carbs, and healthy fats.`,
      `Staying hydrated is crucial! Aim for at least 8 cups (64 ounces) of water daily, and more when you're active or in hot weather.`,
      `Consider adding foods rich in omega-3 fatty acids to your diet, such as salmon, walnuts, and flaxseeds. These can help reduce inflammation and support heart health.`,
    ];
    
    // Return a random response from the list
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    // Add user message to the list
    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: prompt,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Clear the input
    setPrompt("");
    setIsLoading(true);

    try {
      // Get AI response
      const response = await getAIResponse(prompt);
      
      // Add AI response to the list
      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get response. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-6 pt-28 pb-12 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Nutrition Assistant</h1>
            <p className="text-fitmentor-medium-gray">
              Get personalized nutrition advice, meal plans, and diet tips to support your fitness goals
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card p-6 flex flex-col h-[600px]">
              <div className="flex-grow overflow-y-auto mb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex mb-4 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === "user"
                          ? "bg-fitmentor-cream/20 text-fitmentor-cream"
                          : "bg-fitmentor-cream text-fitmentor-black"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex items-center mb-2">
                          <Avatar className="h-6 w-6 mr-2 bg-fitmentor-black">
                            <span>AI</span>
                          </Avatar>
                          <span className="font-bold text-sm">Nutrition Assistant</span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-2 text-right">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start mb-4">
                    <div className="max-w-[80%] rounded-lg p-4 bg-fitmentor-cream text-fitmentor-black">
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2 bg-fitmentor-black">
                          <span>AI</span>
                        </Avatar>
                        <span className="font-bold text-sm">Nutrition Assistant</span>
                      </div>
                      <div className="mt-2 flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-fitmentor-black animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-fitmentor-black animate-bounce delay-100"></div>
                        <div className="w-2 h-2 rounded-full bg-fitmentor-black animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask about nutrition, meal plans, or diet tips..."
                  className="flex-grow bg-fitmentor-dark-gray text-fitmentor-cream border-fitmentor-cream/30"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  className="premium-button"
                  disabled={isLoading || !prompt.trim()}
                >
                  <Send size={18} />
                </Button>
              </form>
            </div>

            <div className="space-y-6">
              <Card className="glass-card p-6">
                <h2 className="text-xl font-bold mb-4">Quick Questions</h2>
                <div className="space-y-2">
                  {[
                    "What should I eat after a workout?",
                    "Best foods for muscle building?",
                    "How to reduce sugar cravings?",
                    "Sample meal plan for weight loss",
                    "How many calories should I eat?",
                  ].map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start text-left border-fitmentor-cream/30 text-fitmentor-cream hover:bg-fitmentor-cream hover:text-fitmentor-black"
                      onClick={() => setPrompt(question)}
                    >
                      <PlusCircle size={16} className="mr-2 flex-shrink-0" />
                      <span className="truncate">{question}</span>
                    </Button>
                  ))}
                </div>
              </Card>

              <Card className="glass-card p-6">
                <h2 className="text-xl font-bold mb-4">Nutrition Tips</h2>
                <ul className="space-y-3 text-fitmentor-medium-gray">
                  <li>• Drink at least 8 glasses of water daily</li>
                  <li>• Include protein with every meal</li>
                  <li>• Eat 5+ servings of vegetables daily</li>
                  <li>• Limit processed foods and added sugars</li>
                  <li>• Plan meals ahead for better choices</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default NutritionPage;
