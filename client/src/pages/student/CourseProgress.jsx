import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  useCompleteCourseMutation,
  useGetCourseProgressQuery,
  useInCompleteCourseMutation,
  useUpdateLectureProgressMutation,
} from "@/features/api/courseProgressApi";
import { CheckCircle, CheckCircle2, CirclePlay } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

const CourseProgress = () => {
  const params = useParams();
  const courseId = params.courseId;
  const { data, isLoading, isError, refetch } =
    useGetCourseProgressQuery(courseId);

  const [updateLectureProgress] = useUpdateLectureProgressMutation();
  const [
    completeCourse,
    { data: markCompleteData, isSuccess: completedSuccess },
  ] = useCompleteCourseMutation();
  const [
    inCompleteCourse,
    { data: markInCompleteData, isSuccess: inCompletedSuccess },
  ] = useInCompleteCourseMutation();

  useEffect(() => {
    if (completedSuccess) {
      refetch();
      toast.success(markCompleteData.message);
    }
    if (inCompletedSuccess) {
      refetch();
      toast.success(markInCompleteData.message);
    }
  }, [completedSuccess, inCompletedSuccess, markCompleteData, markInCompleteData, refetch]);

  const [currentLecture, setCurrentLecture] = useState(null);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Failed to load course details</p>;

  if (!data?.data?.courseDetails) {
    return <p>No course details available</p>;
  }

  const { courseDetails, progress, completed } = data.data;
  const { courseTitle } = courseDetails;
  const lectures = courseDetails.lectures || [];

  const initialLecture = currentLecture || (lectures.length > 0 ? lectures[0] : null);

  const isLectureCompleted = (lectureId) => {
    return progress.some((prog) => prog.lectureId === lectureId && prog.viewed);
  };

  const handleLectureProgress = async (lectureId) => {
    if (!lectureId) return;
    await updateLectureProgress({ courseId, lectureId });
    refetch();
  };

  const handleSelectLecture = (lecture) => {
    setCurrentLecture(lecture);
    handleLectureProgress(lecture._id);
  };

  const handleCompleteCourse = async () => {
    await completeCourse(courseId);
  };
  
  const handleInCompleteCourse = async () => {
    await inCompleteCourse(courseId);
  };

  const getLectureIndex = (lectureId) => {
    if (!lectures || !lectureId) return 0;
    const index = lectures.findIndex(lec => lec._id === lectureId);
    return index !== -1 ? index : 0;
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">{courseTitle}</h1>
        <Button
          onClick={completed ? handleInCompleteCourse : handleCompleteCourse}
          variant={completed ? "outline" : "default"}
        >
          {completed ? (
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" /> <span>Completed</span>{" "}
            </div>
          ) : (
            "Mark as completed"
          )}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 md:w-3/5 h-fit rounded-lg shadow-lg p-4">
          <div>
            {initialLecture ? (
              <video
                src={currentLecture?.videoUrl || initialLecture?.videoUrl || ''}
                controls
                className="w-full h-auto md:rounded-lg"
                onPlay={() =>
                  handleLectureProgress(
                    currentLecture?._id || initialLecture?._id
                  )
                }
              />
            ) : (
              <div className="w-full aspect-video bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">No lecture videos available</p>
              </div>
            )}
          </div>
          <div className="mt-2">
            {initialLecture ? (
              <h3 className="font-medium text-lg">
                {`Lecture ${
                  getLectureIndex(currentLecture?._id || initialLecture?._id) + 1
                } : ${
                  currentLecture?.lectureTitle || initialLecture?.lectureTitle
                }`}
              </h3>
            ) : (
              <h3 className="font-medium text-lg">No lecture selected</h3>
            )}
          </div>
        </div>
        <div className="flex flex-col w-full md:w-2/5 border-t md:border-t-0 md:border-l border-gray-200 md:pl-4 pt-4 md:pt-0">
          <h2 className="font-semibold text-xl mb-4">Course Lecture</h2>
          {lectures.length > 0 ? (
            <div className="flex-1 overflow-y-auto">
              {lectures.map((lecture) => (
                <Card
                  key={lecture._id}
                  className={`mb-3 hover:cursor-pointer transition transform ${
                    lecture._id === currentLecture?._id
                      ? "bg-gray-200 dark:dark:bg-gray-800"
                      : ""
                  } `}
                  onClick={() => handleSelectLecture(lecture)}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center">
                      {isLectureCompleted(lecture._id) ? (
                        <CheckCircle2 size={24} className="text-green-500 mr-2" />
                      ) : (
                        <CirclePlay size={24} className="text-gray-500 mr-2" />
                      )}
                      <div>
                        <CardTitle className="text-lg font-medium">
                          {lecture.lectureTitle}
                        </CardTitle>
                      </div>
                    </div>
                    {isLectureCompleted(lecture._id) && (
                      <Badge
                        variant={"outline"}
                        className="bg-green-200 text-green-600"
                      >
                        Completed
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 italic">No lectures available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseProgress;
