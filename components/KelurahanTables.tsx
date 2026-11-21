"use client";
import React, { useState, useRef, useEffect, useMemo } from 'react';

interface KeplingData {
  kecamatan?: string;
  kelurahan?: string;
  target?: number;
  tk_rekap?: number; // TK AKTIF
  [key: string]: unknown;
}



export default function KelurahanTables({ 
  data = [], 
  filterKec, setFilterKec, filterKel, setFilterKel 
}: { 
  data?: KeplingData[],
  filterKec: string[], setFilterKec: (v: string[]) => void,
  filterKel: string[], setFilterKel: (v: string[]) => void
}) {
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  });

  const kelKecMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    data.forEach(row => {
      const kec = (row.kecamatan || '').toUpperCase().trim();
      const kel = (row.kelurahan || '').toUpperCase().trim();
      if (kel) {
        if (!map.has(kel)) map.set(kel, new Set());
        map.get(kel)!.add(kec);
      }
    });
    return map;
  }, [data]);

  const aggregatedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const map = new Map();

    data.forEach(row => {
      const kec = (row.kecamatan || 'TIDAK DIKETAHUI').toUpperCase().trim();
      const kel = (row.kelurahan || 'TIDAK DIKETAHUI').toUpperCase().trim();
      const uniqueKey = `${kec}_${kel}`;

      if (!map.has(uniqueKey)) {
        map.set(uniqueKey, {
          'Kecamatan': kec,
          'Kelurahan': kel,
          'Jumlah Kepling': 0,
          'TARGET': 0,
          'TK AKTIF': 0, 
        });
      }

      const kelData = map.get(uniqueKey);
      kelData['Jumlah Kepling'] += 1;
      kelData['TARGET'] += (row.target || 0);
      kelData['TK AKTIF'] += (row.tk_rekap || 0); 
    });

    return Array.from(map.values()).map(kelData => {
      const target = kelData['TARGET'];
      const tkAktif = kelData['TK AKTIF'];
      
      const gap = tkAktif - target; 
      const percent = target > 0 ? (tkAktif / target) * 100 : 0;
      
      const formatNum = (num: number) => new Intl.NumberFormat('id-ID').format(num);
      const formatPerc = (num: number) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num) + '%';

      return {
        'Kecamatan': kelData['Kecamatan'],
        'Kelurahan': kelData['Kelurahan'],
        'Jumlah Kepling': formatNum(kelData['Jumlah Kepling']),
        'TARGET': formatNum(target),
        'TK AKTIF': formatNum(tkAktif),
        'GAP': formatNum(gap),
        '%': formatPerc(percent)
      } as Record<string, string>;
    });
  }, [data]);

  const getVal = (row: Record<string, string>, targetKey: string) => {
    const foundKey = Object.keys(row).find((k) => k.trim().toLowerCase() === targetKey.toLowerCase());
    return foundKey ? String(row[foundKey]) : '';
  };

  const parseNum = (val: string) => {
    const num = parseFloat((val || '0').replace(/\./g, '').replace(/,/g, '.'));
    return isNaN(num) ? 0 : num;
  };
  
  const parsePercent = (val: string) => {
    return parseNum(String(val).replace('%', ''));
  };

  const getSharedColor = (val: string) => {
    const percent = parsePercent(val);
    const hue = Math.max(0, Math.min((percent / 100) * 120, 120)); 
    return `hsl(${hue}, 85%, 42%)`; 
  };

  const filteredData = aggregatedData.filter(row => {
    const kec = row.Kecamatan;
    const kel = row.Kelurahan;
    const matchKec = filterKec.includes('ALL') || filterKec.includes(kec);
    
    const expectedLabel = (kelKecMap.get(kel)?.size ?? 0) > 1
      ? `${kel} (${kec})`
      : kel;

    const matchKel = filterKel.includes('ALL') || filterKel.includes(expectedLabel);
    return matchKec && matchKel;
  });

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const displayData = useMemo(() => {
    let sortableItems: Record<string, string>[] = [...filteredData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const valA = getVal(a, sortConfig.key!);
        const valB = getVal(b, sortConfig.key!);

        const cleanValue = (val: string | number | unknown) => {
          if (!val) return 0;
          const strVal = String(val);
          const cleanStr = strVal.replace(/\./g, '').replace(/,/g, '.').replace('%', '');
          const num = parseFloat(cleanStr);
          return isNaN(num) ? strVal : num;
        };

        const cleanedA = cleanValue(valA);
        const cleanedB = cleanValue(valB);

        if (typeof cleanedA === 'number' && typeof cleanedB === 'number') {
          return sortConfig.direction === 'asc' ? cleanedA - cleanedB : cleanedB - cleanedA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      sortableItems.sort((a, b) => parsePercent(getVal(b, '%')) - parsePercent(getVal(a, '%')));
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center">
        <div className="text-[#1b75d8] font-bold text-xl animate-pulse">Menyiapkan Data Kelurahan...</div>
      </div>
    );
  }

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <span className="text-white/30 opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-[10px]">↕</span>;
    return sortConfig.direction === 'asc' ? <span className="text-white ml-1 text-[10px]">▲</span> : <span className="text-white ml-1 text-[10px]">▼</span>;
  };

  const kecOptionsMap = new Map();
  aggregatedData.forEach(row => {
    const kec = getVal(row, 'Kecamatan').toUpperCase();
    if (!kec) return;
    kecOptionsMap.set(kec, (kecOptionsMap.get(kec) || 0) + parseNum(getVal(row, 'TK AKTIF'))); 
  });
  const kecOptions = Array.from(kecOptionsMap.entries()).map(([label, metric]) => ({label, metric})).sort((a,b) => b.metric - a.metric); 

  const availableKelData = filterKec.includes('ALL') ? aggregatedData : aggregatedData.filter(r => filterKec.includes(r.Kecamatan));
  const kelOptionsMap = new Map();
  availableKelData.forEach(row => {
    const kec = row.Kecamatan;
    const kel = row.Kelurahan;
    const label = (kelKecMap.get(kel)?.size ?? 0) > 1 ? `${kel} (${kec})` : kel;
    kelOptionsMap.set(label, (kelOptionsMap.get(label) || 0) + parseNum(row['TK AKTIF'])); 
  });
  const kelOptions = Array.from(kelOptionsMap.entries()).map(([label, metric]) => ({label, metric})).sort((a,b) => b.metric - a.metric);

  const sortedDataDesc = [...filteredData].sort((a, b) => parsePercent(getVal(b, '%')) - parsePercent(getVal(a, '%')));
  const sortedDataAsc = [...filteredData].sort((a, b) => parsePercent(getVal(a, '%')) - parsePercent(getVal(b, '%')));

  const top10Data = sortedDataDesc.slice(0, 10);
  const worst10Data = sortedDataAsc.slice(0, 10);

  return (
    <div className="flex gap-4 w-full h-full">
      <div className="flex-[1.5] relative min-h-full">
        <div className="absolute inset-0 bg-[#f8faeb] p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-3 transition-colors">
          <h2 className="font-bold text-[16px] text-black px-1 flex-none">Rekap Kelurahan</h2>
          <div className="overflow-y-auto flex-1 bg-white rounded-lg border border-gray-200 shadow-inner transition-colors">
            <table className="w-full text-[11px] text-left">
              <thead className="bg-[#2F97FF] text-white font-bold sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-3 py-3 w-10 text-center border-r border-blue-600/30">No.</th>
                  <th onClick={() => handleSort('Kecamatan')} className="px-3 py-3 cursor-pointer group hover:bg-[#1565c0] transition-colors select-none border-r border-blue-600/30">
                    <div className="flex items-center">Kecamatan {getSortIcon('Kecamatan')}</div>
                  </th>
                  <th onClick={() => handleSort('Kelurahan')} className="px-3 py-3 cursor-pointer group hover:bg-[#1565c0] transition-colors select-none border-r border-blue-600/30">
                    <div className="flex items-center">Kelurahan {getSortIcon('Kelurahan')}</div>
                  </th>
                  <th onClick={() => handleSort('Jumlah Kepling')} className="px-2 py-3 w-[80px] cursor-pointer group hover:bg-[#1565c0] transition-colors select-none border-r border-blue-600/30">
                    <div className="flex items-center justify-center text-center leading-tight">Jumlah<br/>Kepling {getSortIcon('Jumlah Kepling')}</div>
                  </th>
                  <th onClick={() => handleSort('TARGET')} className="px-3 py-3 w-[90px] cursor-pointer group hover:bg-[#1565c0] transition-colors select-none border-r border-blue-600/30">
                    <div className="flex items-center justify-center text-center">TARGET {getSortIcon('TARGET')}</div>
                  </th>
                  <th onClick={() => handleSort('TK AKTIF')} className="px-3 py-3 w-[90px] cursor-pointer group hover:bg-[#1565c0] transition-colors select-none border-r border-blue-600/30">
                    <div className="flex items-center justify-center text-center uppercase">JUMLAH <br></br> AKUISISI {getSortIcon('TK AKTIF')}</div>
                  </th>
                  <th onClick={() => handleSort('GAP')} className="px-3 py-3 w-[90px] cursor-pointer group hover:bg-[#1565c0] transition-colors select-none border-r border-blue-600/30">
                    <div className="flex items-center justify-center text-center uppercase">GAP {getSortIcon('GAP')}</div>
                  </th>
                  <th onClick={() => handleSort('%')} className="px-3 py-3 w-[80px] cursor-pointer group hover:bg-[#1565c0] transition-colors select-none">
                    <div className="flex items-center justify-center text-center">% {getSortIcon('%')}</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayData.map((row, index) => (
                  <tr key={index} className="border-b border-gray-100 even:bg-[#eef5e1] odd:bg-white hover:bg-blue-50 transition-colors">
                    <td className="px-3 py-2 text-center text-gray-500">{index + 1}.</td>
                    <td className="px-3 py-2 uppercase font-bold text-gray-800">{getVal(row, 'Kecamatan')}</td>
                    <td className="px-3 py-2 uppercase font-medium text-gray-700">{getVal(row, 'Kelurahan')}</td>
                    <td className="px-2 py-2 text-center text-gray-600">{getVal(row, 'Jumlah Kepling')}</td>
                    <td className="px-3 py-2 text-center text-gray-600">{getVal(row, 'TARGET')}</td>
                    <td className="px-3 py-2 text-center text-gray-600">{getVal(row, 'TK AKTIF')}</td>
                    <td className="px-3 py-2 text-center text-gray-600">{getVal(row, 'GAP')}</td>
                    <td className="px-3 py-2 text-center font-bold text-white border-l border-white/20" style={{ backgroundColor: getSharedColor(getVal(row, '%')) }}>
                      {getVal(row, '%')}
                    </td>
                  </tr>
                ))}
                {displayData.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-10 text-gray-400 font-bold">Data tidak ditemukan</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="w-[500px] flex flex-col gap-4 shrink-0">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col transition-colors">
          <div className="px-4 py-2 bg-white border-b border-gray-200">
            <h2 className="font-bold text-[14px] text-black">Top 10 Kelurahan</h2>
          </div>
          <table className="w-full text-[10px] text-left table-fixed">
            <thead className="bg-[#06AF00] text-white font-bold whitespace-nowrap">
              <tr>
                <th className="px-1 py-2 w-[35px] text-center">No.</th>
                <th className="px-2 py-2 w-[110px]">Kecamatan</th>
                <th className="px-2 py-2">Kelurahan</th>
                <th className="px-1 py-2 w-[60px] text-center uppercase">TARGET</th>
                <th className="px-1 py-2 w-[60px] text-center uppercase leading-tight">TK<br/>AKTIF</th>
                <th className="px-1 py-2 w-[55px] text-center uppercase">GAP</th>
                <th className="px-1 py-2 w-[60px] text-center">%</th>
              </tr>
            </thead>
            <tbody>
              {top10Data.map((row, index) => (
                <tr key={index} className="border-b border-gray-100 even:bg-[#eef5e1] odd:bg-white hover:bg-green-50 transition-colors">
                   <td className="px-1 py-2 text-center font-bold text-gray-500 truncate">{index + 1}.</td>
                   <td className="px-2 py-2 uppercase font-bold text-gray-800 truncate">{getVal(row, 'Kecamatan')}</td>
                   <td className="px-2 py-2 uppercase font-medium text-gray-700 truncate">{getVal(row, 'Kelurahan')}</td>
                   <td className="px-1 py-2 text-center text-gray-600 truncate">{getVal(row, 'TARGET')}</td>
                   <td className="px-1 py-2 text-center text-gray-600 truncate">{getVal(row, 'TK AKTIF')}</td>
                   <td className="px-1 py-2 text-center text-gray-600 truncate">{getVal(row, 'GAP')}</td>
                   <td className="px-1 py-2 text-center font-bold text-white border-l border-white/20 truncate" style={{ backgroundColor: getSharedColor(getVal(row, '%')) }}>
                     {getVal(row, '%')}
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col transition-colors">
          <div className="px-4 py-2 bg-white border-b border-gray-200">
            <h2 className="font-bold text-[14px] text-black">Worst 10 Kelurahan</h2>
          </div>
          <table className="w-full text-[10px] text-left table-fixed">
            <thead className="bg-[#FF0000] text-white font-bold whitespace-nowrap">
              <tr>
                <th className="px-1 py-2 w-[35px] text-center">No.</th>
                <th className="px-2 py-2 w-[110px]">Kecamatan</th>
                <th className="px-2 py-2">Kelurahan</th>
                <th className="px-1 py-2 w-[60px] text-center uppercase">TARGET</th>
                <th className="px-1 py-2 w-[60px] text-center uppercase leading-tight">TK<br/>AKTIF</th>
                <th className="px-1 py-2 w-[55px] text-center uppercase">GAP</th>
                <th className="px-1 py-2 w-[60px] text-center">%</th>
              </tr>
            </thead>
            <tbody>
               {worst10Data.map((row, index) => (
                 <tr key={index} className="border-b border-gray-100 even:bg-red-50 odd:bg-white hover:bg-red-100 transition-colors">
                    <td className="px-1 py-2 text-center font-bold text-gray-500 truncate">{index + 1}.</td>
                    <td className="px-2 py-2 uppercase font-bold text-gray-800 truncate">{getVal(row, 'Kecamatan')}</td>
                    <td className="px-2 py-2 uppercase font-medium text-gray-700 truncate">{getVal(row, 'Kelurahan')}</td>
                    <td className="px-1 py-2 text-center text-gray-600 truncate">{getVal(row, 'TARGET')}</td>
                    <td className="px-1 py-2 text-center text-gray-600 truncate">{getVal(row, 'TK AKTIF')}</td>
                    <td className="px-1 py-2 text-center text-gray-600 truncate">{getVal(row, 'GAP')}</td>
                    <td className="px-1 py-2 text-center font-bold text-white border-l border-white/20 truncate" style={{ backgroundColor: getSharedColor(getVal(row, '%')) }}>
                      {getVal(row, '%')}
                    </td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
