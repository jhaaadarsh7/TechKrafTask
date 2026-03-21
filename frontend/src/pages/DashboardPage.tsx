import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";
import type { ApiResponse, Favourite, Property } from "../types";

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

  const [properties, setProperties] = useState<Property[]>([]);
  const [favourites, setFavourites] = useState<Favourite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyPropertyId, setBusyPropertyId] = useState<number | null>(null);

  const favouriteIds = useMemo(
    () => new Set(favourites.map((item) => item.propertyId)),
    [favourites]
  );

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [propertyResponse, favouritesResponse] = await Promise.all([
        apiRequest<ApiResponse<Property[]>>("/properties", { token }),
        apiRequest<ApiResponse<Favourite[]>>("/favourites", { token }),
      ]);
      setProperties(propertyResponse.data);
      setFavourites(favouritesResponse.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleFavourite = async (propertyId: number) => {
    if (!token || busyPropertyId === propertyId) return;
    const removing = favouriteIds.has(propertyId);
    setBusyPropertyId(propertyId);
    setError(null);
    try {
      await apiRequest<{ success: boolean; message: string }>(`/favourites/${propertyId}`, {
        method: removing ? "DELETE" : "POST",
        token,
      });
      const updated = await apiRequest<ApiResponse<Favourite[]>>("/favourites", { token });
      setFavourites(updated.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update favourites");
    } finally {
      setBusyPropertyId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F7F5F2]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-stone-300 border-t-orange-500 animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
            Loading…
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F5F2]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        * { font-family: 'DM Sans', sans-serif; }
        .font-serif { font-family: 'DM Serif Display', serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(28px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes dropDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-fade-up   { animation: fadeUp  0.5s ease-out both; }
        .anim-slide-left{ animation: slideLeft 0.5s ease-out both; }
        .anim-drop-down { animation: dropDown 0.4s ease-out both; }

        /* Card image zoom */
        .card-img { transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
        .property-card:hover .card-img { transform: scale(1.06); }

        /* Heart pulse */
        @keyframes heartPop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.35); }
          70%  { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .heart-pop { animation: heartPop 0.35s ease-out; }

        /* Favourite item enter */
        @keyframes favSlide {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .fav-item { animation: favSlide 0.3s ease-out both; }

        /* Custom scrollbar for sidebar */
        .fav-list::-webkit-scrollbar { width: 4px; }
        .fav-list::-webkit-scrollbar-track { background: transparent; }
        .fav-list::-webkit-scrollbar-thumb { background: #D6CFC6; border-radius: 99px; }
      `}</style>

      <header className="anim-drop-down sticky top-0 z-50 border-b border-stone-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-sm font-bold text-white shadow-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-stone-400">
                Welcome back
              </p>
              <h1 className="font-serif text-lg leading-tight text-stone-900">{user?.name}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-orange-600 sm:inline-flex">
              {user?.role}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="group flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-600 transition-all hover:border-stone-900 hover:bg-stone-900 hover:text-white"
            >
              <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <div className="anim-fade-up flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 text-xs font-bold">!</span>
            {error}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-8">

          <section className="min-w-0 flex-1 anim-fade-up">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="font-serif text-4xl text-stone-900">Properties</h2>
                <p className="mt-1 text-sm text-stone-500">
                  {properties.length} listings available
                </p>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-500 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                Live
              </div>
            </div>

            {properties.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white/60 py-20 text-center">
                <p className="text-stone-500">No properties available right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {properties.map((property, idx) => {
                  const isFavourite = favouriteIds.has(property.id);
                  const isBusy = busyPropertyId === property.id;

                  return (
                    <article
                      key={property.id}
                      style={{ animationDelay: `${idx * 0.06}s` }}
                      className="property-card anim-fade-up group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)]"
                    >
                      <div className="relative h-52 shrink-0 overflow-hidden bg-stone-100">
                        <img
                          src={
                            property.imageUrl ??
                            "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=900&q=80"
                          }
                          alt={property.title}
                          className="card-img h-full w-full object-cover"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                        <div className="absolute bottom-3 left-3">
                          <span className="rounded-lg bg-white/95 px-2.5 py-1 text-sm font-bold text-stone-900 shadow-sm backdrop-blur-sm">
                            NPR {property.price.toLocaleString()}
                          </span>
                        </div>

                        <div className="absolute left-3 top-3">
                          <span className="rounded-full bg-amber-500/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-sm">
                            Premium
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleFavourite(property.id)}
                          disabled={isBusy}
                          aria-label={isFavourite ? "Remove favourite" : "Add favourite"}
                          className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border text-lg shadow-md backdrop-blur-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
                            isFavourite
                              ? "border-rose-300 bg-rose-500 text-white scale-105"
                              : "border-white/60 bg-white/80 text-stone-500 hover:border-rose-300 hover:bg-rose-500 hover:text-white hover:scale-110"
                          }`}
                        >
                          {isBusy ? (
                            <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                          ) : (
                            <span className={isFavourite ? "heart-pop" : ""}>{isFavourite ? "♥" : "♡"}</span>
                          )}
                        </button>
                      </div>

                      {/* Body */}
                      <div className="flex flex-1 flex-col p-4">
                        <h3 className="line-clamp-1 text-base font-semibold text-stone-900">
                          {property.title}
                        </h3>

                        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-stone-500">
                          <svg className="h-3.5 w-3.5 shrink-0 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="line-clamp-1">{property.location}</span>
                        </div>

                        <div className="my-4 h-px w-full bg-stone-100" />

                        <button
                          type="button"
                          onClick={() => toggleFavourite(property.id)}
                          disabled={isBusy}
                          className={`mt-auto flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
                            isFavourite
                              ? "bg-rose-50 text-rose-600 hover:bg-rose-100 ring-1 ring-rose-200"
                              : "bg-orange-500 text-white hover:bg-orange-600 shadow-sm"
                          }`}
                        >
                          {isBusy ? (
                            <>
                              <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                              Updating…
                            </>
                          ) : isFavourite ? (
                            <>
                              <span>♥</span>
                              Remove Favourite
                            </>
                          ) : (
                            <>
                              <span>♡</span>
                              Add to Favourites
                            </>
                          )}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="anim-slide-left w-full lg:w-[260px] lg:shrink-0">
            <div className="sticky top-20 overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">

              <div className="border-b border-stone-100 bg-gradient-to-r from-orange-50 to-amber-50 px-5 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl text-stone-900">Saved</h3>
                  {favourites.length > 0 && (
                    <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-orange-500 px-2 text-[11px] font-bold text-white">
                      {favourites.length}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-stone-500">
                  {favourites.length === 0
                    ? "No properties saved yet"
                    : `${favourites.length} saved ${favourites.length === 1 ? "property" : "properties"}`}
                </p>
              </div>

              {favourites.length === 0 ? (
                <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-2xl text-stone-300">
                    ♡
                  </div>
                  <p className="text-sm text-stone-500">
                    Tap the heart on any property to save it here.
                  </p>
                </div>
              ) : (
                <ul className="fav-list max-h-[62vh] divide-y divide-stone-100 overflow-y-auto">
                  {favourites.map((item, idx) => (
                    <li
                      key={item.id}
                      style={{ animationDelay: `${idx * 0.05}s` }}
                      className="fav-item group flex flex-col gap-3 px-4 py-4 transition hover:bg-stone-50"
                    >
                      <div className="flex gap-3">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                          <img
                            src={
                              item.property.imageUrl ??
                              "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=200&q=70"
                            }
                            alt={item.property.title}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-semibold leading-snug text-stone-900">
                            {item.property.title}
                          </p>
                          <p className="mt-1 line-clamp-1 text-xs text-stone-500">{item.property.location}</p>
                          <p className="mt-1.5 text-sm font-bold text-orange-600">
                            NPR {item.property.price.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleFavourite(item.propertyId)}
                        disabled={busyPropertyId === item.propertyId}
                        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {busyPropertyId === item.propertyId ? (
                          <>
                            <span className="h-3 w-3 rounded-full border border-current border-t-transparent animate-spin" />
                            Updating…
                          </>
                        ) : (
                          <>
                            <span>♥</span>
                            Remove Favourite
                          </>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {favourites.length > 0 && (
                <div className="border-t border-stone-100 bg-stone-50 px-5 py-3">
                  <p className="text-xs text-stone-500">
                    Total:{" "}
                    <span className="font-bold text-stone-800">
                      NPR{" "}
                      {favourites
                        .reduce((sum, f) => sum + f.property.price, 0)
                        .toLocaleString()}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </aside>

        </div>
      </div>
    </main>
  );
}
