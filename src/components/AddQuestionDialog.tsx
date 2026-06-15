import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import {
    Plus, Plane, TrainFront, CarFront, TreePine, Landmark, Camera,
    Waves, Target, Map, Ruler, Thermometer, Network
} from "lucide-react";

export function AddQuestionDialog() {
    const [open, setOpen] = useState(false);

    // DUMMY FUNCTION FOR NOW: We will wire this up to the "Preview/Submit" logic next!
    const handleQuestionSelect = (type: string, detail?: string) => {
        console.log("Selected:", type, detail);
        // setOpen(false); // Keeps modal open for now so you can test the UI
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full flex items-center justify-center gap-2 py-6 text-lg rounded-none border-b border-border">
                    <Plus className="w-6 h-6" /> Add Question
                </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-6xl bg-gray-100 p-0 flex flex-col max-h-[90dvh] w-[95vw] sm:w-full rounded-lg overflow-hidden">
                <DialogHeader className="bg-red-600 p-3 sm:p-4 m-0 shrink-0">
                    <DialogTitle className="text-white text-center font-bold text-xl sm:text-2xl uppercase tracking-widest m-0">
                        Question Menu
                    </DialogTitle>
                </DialogHeader>

                <div className="overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-6">

                    {/* MATCHING */}
                    <div className="flex flex-col border-t-4 border-slate-800 pt-3">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="bg-slate-800 p-1.5 rounded text-white shrink-0">
                                <Map className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 uppercase leading-none text-sm sm:text-base">Matching</h3>
                                <span className="text-[9px] sm:text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Draw 3, Pick 1</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-2">
                            <button onClick={() => handleQuestionSelect("matching", "airport")} className="bg-slate-800 text-white flex justify-center items-center hover:bg-slate-700 aspect-square transition-colors rounded-sm sm:rounded-none"><Plane className="w-5 h-5 sm:w-6 sm:h-6"/></button>
                            <button onClick={() => handleQuestionSelect("matching", "region")} className="bg-slate-800 text-white flex justify-center items-center hover:bg-slate-700 aspect-square transition-colors rounded-sm sm:rounded-none"><Map className="w-5 h-5 sm:w-6 sm:h-6"/></button>
                            <button onClick={() => handleQuestionSelect("matching", "mountains")} className="bg-slate-800 text-white flex justify-center items-center hover:bg-slate-700 aspect-square transition-colors rounded-sm sm:rounded-none"><TreePine className="w-5 h-5 sm:w-6 sm:h-6"/></button>
                            <button onClick={() => handleQuestionSelect("matching", "landmark")} className="bg-slate-800 text-white flex justify-center items-center hover:bg-slate-700 aspect-square transition-colors rounded-sm sm:rounded-none"><Landmark className="w-5 h-5 sm:w-6 sm:h-6"/></button>

                            <button onClick={() => handleQuestionSelect("matching", "train")} className="bg-slate-800 text-white flex justify-center items-center hover:bg-slate-700 aspect-square transition-colors rounded-sm sm:rounded-none"><TrainFront className="w-5 h-5 sm:w-6 sm:h-6"/></button>
                            <button onClick={() => handleQuestionSelect("matching", "region2")} className="bg-slate-800 text-white flex justify-center items-center hover:bg-slate-700 aspect-square transition-colors rounded-sm sm:rounded-none"><Map className="w-5 h-5 sm:w-6 sm:h-6"/></button>
                            <button onClick={() => handleQuestionSelect("matching", "water")} className="bg-slate-800 text-white flex justify-center items-center hover:bg-slate-700 aspect-square transition-colors rounded-sm sm:rounded-none"><Waves className="w-5 h-5 sm:w-6 sm:h-6"/></button>
                            <button onClick={() => handleQuestionSelect("matching", "target")} className="bg-slate-800 text-white flex justify-center items-center hover:bg-slate-700 aspect-square transition-colors rounded-sm sm:rounded-none"><Target className="w-5 h-5 sm:w-6 sm:h-6"/></button>
                        </div>
                    </div>

                    {/* MEASURING */}
                    <div className="flex flex-col border-t-4 border-green-600 pt-3">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="bg-green-600 p-1.5 rounded text-white shrink-0">
                                <Ruler className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-green-600 uppercase leading-none text-sm sm:text-base">Measuring</h3>
                                <span className="text-[9px] sm:text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Draw 3, Pick 1</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-2">
                            <button onClick={() => handleQuestionSelect("measuring", "airport")} className="bg-green-600 text-white flex justify-center items-center hover:bg-green-700 aspect-square transition-colors rounded-sm sm:rounded-none"><Plane className="w-5 h-5 sm:w-6 sm:h-6"/></button>
                            <button onClick={() => handleQuestionSelect("measuring", "region")} className="bg-green-600 text-white flex justify-center items-center hover:bg-green-700 aspect-square transition-colors rounded-sm sm:rounded-none"><Map className="w-5 h-5 sm:w-6 sm:h-6"/></button>
                            <button onClick={() => handleQuestionSelect("measuring", "mountains")} className="bg-green-600 text-white flex justify-center items-center hover:bg-green-700 aspect-square transition-colors rounded-sm sm:rounded-none"><TreePine className="w-5 h-5 sm:w-6 sm:h-6"/></button>
                            <button onClick={() => handleQuestionSelect("measuring", "landmark")} className="bg-green-600 text-white flex justify-center items-center hover:bg-green-700 aspect-square transition-colors rounded-sm sm:rounded-none"><Landmark className="w-5 h-5 sm:w-6 sm:h-6"/></button>

                            <button onClick={() => handleQuestionSelect("measuring", "train")} className="bg-green-600 text-white flex justify-center items-center hover:bg-green-700 aspect-square transition-colors rounded-sm sm:rounded-none"><TrainFront className="w-5 h-5 sm:w-6 sm:h-6"/></button>
                            <button onClick={() => handleQuestionSelect("measuring", "region2")} className="bg-green-600 text-white flex justify-center items-center hover:bg-green-700 aspect-square transition-colors rounded-sm sm:rounded-none"><Map className="w-5 h-5 sm:w-6 sm:h-6"/></button>
                            <button onClick={() => handleQuestionSelect("measuring", "water")} className="bg-green-600 text-white flex justify-center items-center hover:bg-green-700 aspect-square transition-colors rounded-sm sm:rounded-none"><Waves className="w-5 h-5 sm:w-6 sm:h-6"/></button>
                            <button onClick={() => handleQuestionSelect("measuring", "target")} className="bg-green-600 text-white flex justify-center items-center hover:bg-green-700 aspect-square transition-colors rounded-sm sm:rounded-none"><Target className="w-5 h-5 sm:w-6 sm:h-6"/></button>
                        </div>
                    </div>

                    {/* RADAR */}
                    <div className="flex flex-col border-t-4 border-orange-500 pt-3">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="bg-orange-500 p-1.5 rounded text-white shrink-0">
                                <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-orange-500 uppercase leading-none text-sm sm:text-base">Radar</h3>
                                <span className="text-[9px] sm:text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Draw 2, Pick 1</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-2">
                            <button onClick={() => handleQuestionSelect("radar", "0.25")} className="bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 aspect-square transition-colors rounded-sm sm:rounded-none">¼ mi</button>
                            <button onClick={() => handleQuestionSelect("radar", "0.5")} className="bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 aspect-square transition-colors rounded-sm sm:rounded-none">½ mi</button>
                            <button onClick={() => handleQuestionSelect("radar", "1")} className="bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 aspect-square transition-colors rounded-sm sm:rounded-none">1 mi</button>
                            <button onClick={() => handleQuestionSelect("radar", "3")} className="bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 aspect-square transition-colors rounded-sm sm:rounded-none">3 mi</button>
                            
                            <button onClick={() => handleQuestionSelect("radar", "5")} className="bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 aspect-square transition-colors rounded-sm sm:rounded-none">5 mi</button>
                            <button onClick={() => handleQuestionSelect("radar", "10")} className="bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 aspect-square transition-colors rounded-sm sm:rounded-none">10 mi</button>
                            <button onClick={() => handleQuestionSelect("radar", "25")} className="bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 aspect-square transition-colors rounded-sm sm:rounded-none">25 mi</button>
                            <button onClick={() => handleQuestionSelect("radar", "50")} className="bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 aspect-square transition-colors rounded-sm sm:rounded-none">50 mi</button>
                            
                            <button onClick={() => handleQuestionSelect("radar", "100")} className="bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 aspect-square transition-colors rounded-sm sm:rounded-none">100 mi</button>
                            <button onClick={() => handleQuestionSelect("radar", "unknown")} className="bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 aspect-square transition-colors rounded-sm sm:rounded-none">????</button>
                        </div>
                    </div>

                    {/* THERMOMETER & TENTACLES COLUMN */}
                    <div className="flex flex-col gap-6">
                        {/* Thermometer */}
                        <div className="flex flex-col border-t-4 border-yellow-400 pt-3">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="bg-yellow-400 p-1.5 rounded text-white shrink-0">
                                    <Thermometer className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-yellow-500 uppercase leading-none text-sm sm:text-base">Thermometer</h3>
                                    <span className="text-[9px] sm:text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Draw 2, Pick 1</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-2">
                                <button onClick={() => handleQuestionSelect("thermometer", "1")} className="bg-yellow-400 text-white text-[10px] sm:text-xs font-bold flex flex-col justify-center items-center hover:bg-yellow-500 aspect-square transition-colors rounded-sm sm:rounded-none">
                                    <Thermometer className="w-4 h-4 sm:w-5 sm:h-5"/> 1m
                                </button>
                                <button onClick={() => handleQuestionSelect("thermometer", "5")} className="bg-yellow-400 text-white text-[10px] sm:text-xs font-bold flex flex-col justify-center items-center hover:bg-yellow-500 aspect-square transition-colors rounded-sm sm:rounded-none">
                                    <Thermometer className="w-4 h-4 sm:w-5 sm:h-5"/> 5m
                                </button>
                                <button onClick={() => handleQuestionSelect("thermometer", "10")} className="bg-yellow-400 text-white text-[10px] sm:text-xs font-bold flex flex-col justify-center items-center hover:bg-yellow-500 aspect-square transition-colors rounded-sm sm:rounded-none">
                                    <Thermometer className="w-4 h-4 sm:w-5 sm:h-5"/> 10m
                                </button>
                            </div>
                        </div>

                        {/* Tentacles */}
                        <div className="flex flex-col border-t-4 border-purple-600 pt-3">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="bg-purple-600 p-1.5 rounded text-white shrink-0">
                                    <Network className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-purple-600 uppercase leading-none text-sm sm:text-base">Tentacles</h3>
                                    <span className="text-[9px] sm:text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Draw 4, Pick 2</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-2">
                                <button onClick={() => handleQuestionSelect("tentacles", "landmark")} className="bg-purple-600 text-white flex justify-center items-center hover:bg-purple-700 aspect-square transition-colors rounded-sm sm:rounded-none"><Landmark className="w-5 h-5 sm:w-6 sm:h-6"/></button>
                                <button onClick={() => handleQuestionSelect("tentacles", "map")} className="bg-purple-600 text-white flex justify-center items-center hover:bg-purple-700 aspect-square transition-colors rounded-sm sm:rounded-none"><Map className="w-5 h-5 sm:w-6 sm:h-6"/></button>
                                <button onClick={() => handleQuestionSelect("tentacles", "ferris")} className="bg-purple-600 text-white flex justify-center items-center hover:bg-purple-700 aspect-square transition-colors rounded-sm sm:rounded-none"><Target className="w-5 h-5 sm:w-6 sm:h-6"/></button>
                                <button onClick={() => handleQuestionSelect("tentacles", "building")} className="bg-purple-600 text-white flex justify-center items-center hover:bg-purple-700 aspect-square transition-colors rounded-sm sm:rounded-none"><Landmark className="w-5 h-5 sm:w-6 sm:h-6"/></button>
                            </div>
                        </div>
                    </div>

                    {/* PHOTO */}
                    <div className="flex flex-col border-t-4 border-sky-400 pt-3">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="bg-sky-400 p-1.5 rounded text-white shrink-0">
                                <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sky-400 uppercase leading-none text-sm sm:text-base">Photo</h3>
                                <span className="text-[9px] sm:text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Draw 1</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-2">
                            <button onClick={() => handleQuestionSelect("photo", "camera")} className="bg-sky-400 text-white flex justify-center items-center hover:bg-sky-500 aspect-square transition-colors rounded-sm sm:rounded-none"><Camera className="w-5 h-5 sm:w-6 sm:h-6"/></button>
                            <button onClick={() => handleQuestionSelect("photo", "tree")} className="bg-sky-400 text-white flex justify-center items-center hover:bg-sky-500 aspect-square transition-colors rounded-sm sm:rounded-none"><TreePine className="w-5 h-5 sm:w-6 sm:h-6"/></button>
                            <button onClick={() => handleQuestionSelect("photo", "train")} className="bg-sky-400 text-white flex justify-center items-center hover:bg-sky-500 aspect-square transition-colors rounded-sm sm:rounded-none"><TrainFront className="w-5 h-5 sm:w-6 sm:h-6"/></button>
                            <button onClick={() => handleQuestionSelect("photo", "car")} className="bg-sky-400 text-white flex justify-center items-center hover:bg-sky-500 aspect-square transition-colors rounded-sm sm:rounded-none"><CarFront className="w-5 h-5 sm:w-6 sm:h-6"/></button>
                            <button onClick={() => handleQuestionSelect("photo", "map")} className="bg-sky-400 text-white flex justify-center items-center hover:bg-sky-500 aspect-square transition-colors rounded-sm sm:rounded-none"><Map className="w-5 h-5 sm:w-6 sm:h-6"/></button>
                            <button onClick={() => handleQuestionSelect("photo", "landmark")} className="bg-sky-400 text-white flex justify-center items-center hover:bg-sky-500 aspect-square transition-colors rounded-sm sm:rounded-none"><Landmark className="w-5 h-5 sm:w-6 sm:h-6"/></button>
                        </div>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
}
