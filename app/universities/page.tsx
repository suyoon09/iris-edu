"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import type { UniversityListItem } from "@/types/university";

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<UniversityListItem[]>([]);
  const [filteredUniversities, setFilteredUniversities] = useState<UniversityListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUniversities();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredUniversities(
        universities.filter(
          (u) =>
            u.name.toLowerCase().includes(query) ||
            u.name_short.toLowerCase().includes(query) ||
            u.location.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredUniversities(universities);
    }
  }, [searchQuery, universities]);

  const fetchUniversities = async () => {
    try {
      const response = await fetch("/api/universities");
      if (response.ok) {
        const data = await response.json();
        setUniversities(data);
        setFilteredUniversities(data);
      }
    } catch (error) {
      console.error("Error fetching universities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAcceptanceRateColor = (rate: number) => {
    if (rate < 10) return "bg-red-100 text-red-700";
    if (rate < 20) return "bg-amber-100 text-amber-700";
    if (rate < 40) return "bg-green-100 text-green-700";
    return "bg-slate-100 text-slate-700";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">대학 정보</h1>
            <p className="text-slate-500 mt-1">
              미국 상위 50개 대학 정보 및 한국 학생 맞춤 조언
            </p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <Input
              placeholder="대학명, 약어, 위치로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* University List */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUniversities.map((university) => (
                <Link
                  key={university.university_id}
                  href={`/universities/${university.university_id}`}
                >
                  <Card className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer h-full">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate">
                            {university.name}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {university.name_short}
                          </p>
                        </div>
                        <Badge className={getAcceptanceRateColor(university.acceptance_rate)}>
                          {university.acceptance_rate}%
                        </Badge>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-slate-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {university.location}
                        </div>
                        <Badge variant="default">{university.type}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {filteredUniversities.length === 0 && !isLoading && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-slate-500">검색 결과가 없습니다.</p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
