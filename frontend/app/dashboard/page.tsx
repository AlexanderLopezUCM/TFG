'use server';

import { redirect } from 'next/navigation';

const redirectToDashboardSearch = async (id: string) => {
	redirect('/dashboard/search');
};

export default redirectToDashboardSearch;