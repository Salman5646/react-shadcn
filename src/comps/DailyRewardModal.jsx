import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins, Check, Gift, Sparkles } from "lucide-react";

export function DailyRewardModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [rewardData, setRewardData] = useState(null);

    useEffect(() => {
        const handleLoginReward = (event) => {
            if (event.detail) {
                setRewardData(event.detail);
                setIsOpen(true);
            }
        };

        window.addEventListener("loginReward", handleLoginReward);
        return () => window.removeEventListener("loginReward", handleLoginReward);
    }, []);

    if (!rewardData) return null;

    const { reward, streak, isDay7, isViewing } = rewardData;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md text-center border-none shadow-2xl bg-gradient-to-b from-white to-orange-50 dark:from-zinc-900 dark:to-zinc-950 overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" />
                </div>

                <DialogHeader className="relative z-10 flex flex-col items-center pt-8 pb-4">
                    <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-yellow-400 to-amber-500 rounded-full flex items-center justify-center p-1 shadow-lg shadow-yellow-500/30 mb-4 animate-bounce-short">
                        <div className="w-full h-full bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center">
                            {isDay7 ? (
                                <Gift className="w-10 h-10 text-yellow-500" />
                            ) : (
                                <Coins className="w-10 h-10 text-yellow-500" />
                            )}
                        </div>
                    </div>

                    <DialogTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                        {isViewing ? "Daily Login Progress" : (isDay7 ? "Day 7 Bonus Reached! 🎉" : "Daily Check-in Complete!")}
                    </DialogTitle>
                    <DialogDescription className="text-base font-medium text-amber-600 dark:text-amber-400 mt-2">
                        {isViewing ? "Keep logging in to earn more coins!" : `You earned +${reward} Shopr Coins!`}
                    </DialogDescription>
                </DialogHeader>

                <div className="relative z-10 px-4 pb-8 space-y-6">
                    {/* The 7-day visual tracker */}
                    <div className="flex justify-between items-center bg-white dark:bg-zinc-900/50 p-4 rounded-2xl shadow-inner border border-zinc-100 dark:border-zinc-800">
                        {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                            const isPast = isViewing ? day <= streak : day < streak;
                            const isToday = isViewing ? false : day === streak;
                            const isFuture = day > streak;

                            return (
                                <div key={day} className="flex flex-col items-center gap-2">
                                    <div className={`relative flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-500 ${isPast ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                                        isToday ? 'bg-amber-500 text-white shadow-md shadow-amber-500/40 ring-4 ring-amber-100 dark:ring-amber-900/30 scale-110' :
                                            'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'
                                        }`}>
                                        {isPast ? <Check className="w-4 h-4" /> : day === 7 ? <Gift className="w-4 h-4" /> : day}

                                        {/* Particle effect for today */}
                                        {isToday && (
                                            <Sparkles className="absolute -top-3 -right-3 w-4 h-4 text-amber-500 animate-pulse" />
                                        )}
                                    </div>
                                    <span className={`text-[10px] font-medium ${(isPast || isToday) ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-400 dark:text-zinc-500'}`}>
                                        Day {day}
                                    </span>
                                </div>
                            )
                        })}
                    </div>

                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {isDay7
                            ? "Incredible! Your streak resets tomorrow for the next cycle."
                            : `Come back tomorrow for ${streak + 1 === 7 ? 'the Day 7 Bonus' : 'another reward'}!`}
                    </p>

                    <Button
                        onClick={() => setIsOpen(false)}
                        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg shadow-amber-500/20 rounded-xl"
                    >
                        Awesome!
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
