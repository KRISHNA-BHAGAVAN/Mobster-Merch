import { useState, useEffect, useRef } from "react";
import { ChevronRightOutlined, ChevronLeftOutlined } from "@mui/icons-material";
import { Navbar } from '../components/Navbar';
import { useNavigate, useLocation } from 'react-router-dom';


interface Slide {
  src: string;
  alt: string;
  text: string;
}

interface PromotionsProps {
  showNavbar?: boolean;
}

export const Promotions: React.FC<PromotionsProps> = ({showNavbar}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const shouldShowNavbar = showNavbar ?? location.state?.showNavbar ?? false;
  const slides: Slide[] = [
    {
      src: "images/swords.png",
      alt: "Slide 2",
      text: "When rare coffee is bought to your kitchen",
    },
    {
      src: "images/red-line-art.png",
      alt: "Slide 1",
      text: "Streamline your food processing business the Sleek way",
    },
    {
      src: "images/dragon.jpeg",
      alt: "Slide 3",
      text: "Enjoy a classic taste for Modern coffee lovers",
    },
    {
      src: "images/mumbai-hotel.jpg",
      alt: "Slide 4",
      text: "We bottled something that is more than a filter coffee",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [paused, setPaused] = useState<boolean>(false);

  // ✅ Browser-friendly type
  const intervalRef = useRef<number | null>(null);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const goToSlide = (idx: number) => setCurrentIndex(idx);

  useEffect(() => {
    if (!paused) {
      intervalRef.current = window.setInterval(nextSlide, 2000);
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [paused, currentIndex]);

  return (
    <div className="bg-background">
      {shouldShowNavbar && <Navbar />}

      <div className="py-5">
        <div className="relative overflow-hidden w-[80vw] h-[80vh] mx-auto">
          <div>
            <h1 className="mx-auto text-4xl text-center">Promotions</h1>
            <div className="samurai-divider w-24 mx-auto mb-6"></div>
          </div>
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
            }}
          >
            {slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] xl:h-[94vh] flex-shrink-0 relative"
              >
                <img
                  src={slide.src}
                  alt={slide.alt}
                  className="w-full h-full object-cover rounded-sm"
                />
              </div>
            ))}
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 bottom-40  md:bottom-6 flex gap-2 sm:gap-3 z-20">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={` w-2 h-2  md:w-4 md:h-4 rounded-full border-2 border-white transition-all duration-200 ${
                  currentIndex === idx ? "bg-white" : "bg-gray-400 opacity-60"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            className="absolute left-2 sm:left-3 md:left-4 top-1/2 transform -translate-y-1/2 bg-gray-300 text-koyya2 rounded-full p-1 sm:p-1.5 md:p-2 shadow-lg hover:bg-gray-200 transition"
            onClick={() =>
              setCurrentIndex(
                (currentIndex - 1 + slides.length) % slides.length
              )
            }
            aria-label="Previous slide"
          >
            <ChevronLeftOutlined className="text-gray-800" />
          </button>

          <button
            className="absolute right-2 sm:right-3 md:right-4 top-1/2 transform -translate-y-1/2 bg-gray-300 text-koyya2 rounded-full p-1 sm:p-1.5 md:p-2 shadow-lg hover:bg-gray-200 transition"
            onClick={() => setCurrentIndex((currentIndex + 1) % slides.length)}
            aria-label="Next slide"
          >
            <ChevronRightOutlined className="text-gray-800" />
          </button>
        </div>
      </div>
    </div>
  );
};

